import {
  Box,
  CliRenderEvents,
  SelectRenderable,
  SelectRenderableEvents,
  TextRenderable as OpenTuiText,
  createCliRenderer,
} from "@opentui/core";
import clipboardy from "clipboardy";
import { createEnvDocument, createMaskedValuesSummary, createPreview } from "../env-document";
import { writeEnvFile } from "../io";
import { buildActions } from "./actions";
import {
  dashboardActionFromKey,
  dashboardActionLabel,
  normalizeDashboardKey,
} from "./keyboard";
import { setContent } from "./renderable";
import type { DashboardAction, DashboardResult, DashboardState } from "./types";

export async function runDashboard(
  rawInput: string,
  prefix: string,
  state: DashboardState,
): Promise<DashboardResult> {
  const renderer = await createCliRenderer({
    exitOnCtrlC: false,
    targetFps: 30,
    backgroundColor: "#0B1220",
  });

  let busy = false;
  let closed = false;
  let lastKey = "none";
  let lastMessage = "Ready. Use arrows + Enter, or direct keys: 1/c copy, 2/s save.";
  let lastHandledKey = "";
  let lastHandledAt = 0;

  const screenHeight = Math.max(renderer.height || process.stdout.rows || 24, 24);
  const maskedValuesHeight = 4;
  const summaryHeight = 3;
  const actionsHeight = 8;
  const previewHeight = Math.max(6, screenHeight - maskedValuesHeight - summaryHeight - actionsHeight);
  const document = createEnvDocument(rawInput, prefix);

  const preview = new OpenTuiText(renderer, {
    content: createPreview(rawInput, prefix),
    fg: "#F8FAFC",
    height: Math.max(1, previewHeight - 2),
  });

  const meta = new OpenTuiText(renderer, {
    content: buildSummary(),
    fg: "#A7F3D0",
    height: 1,
    truncate: true,
  });

  const maskedValues = new OpenTuiText(renderer, {
    content: createMaskedValuesSummary(document),
    fg: document.result.maskedValueNames.length > 0 ? "#FCA5A5" : "#94A3B8",
    height: Math.max(1, maskedValuesHeight - 2),
    wrapMode: "word",
  });

  const status = new OpenTuiText(renderer, {
    content: `Status: ${lastMessage}`,
    fg: "#FDE68A",
    height: 1,
    truncate: true,
  });

  const lastKeyText = new OpenTuiText(renderer, {
    content: `Last key: ${lastKey}`,
    fg: "#93C5FD",
    height: 1,
    truncate: true,
  });

  const select = new SelectRenderable(renderer, {
    width: "100%",
    height: 4,
    options: buildActions(state, document.result.variables.length),
    selectedIndex: 0,
    showDescription: false,
    showScrollIndicator: true,
    wrapSelection: true,
    backgroundColor: "#111827",
    textColor: "#E5E7EB",
    focusedBackgroundColor: "#111827",
    focusedTextColor: "#F8FAFC",
    selectedBackgroundColor: "#0F766E",
    selectedTextColor: "#FFFFFF",
    descriptionColor: "#94A3B8",
    selectedDescriptionColor: "#CCFBF1",
    keyBindings: [
      { name: "return", action: "select-current" },
      { name: "enter", action: "select-current" },
      { name: "up", action: "move-up" },
      { name: "down", action: "move-down" },
    ],
  });

  function buildSummary() {
    return `✅ Found ${document.result.variables.length} variable(s)  •  Output: ${state.outputPath}  •  Overwrite: ${state.force ? "ON" : "OFF"}`;
  }

  function isClosed() {
    return closed || renderer.isDestroyed || status.isDestroyed || lastKeyText.isDestroyed || meta.isDestroyed;
  }

  function isDestroyedTextBufferError(error: unknown) {
    return error instanceof Error && error.message.includes("TextBuffer is destroyed");
  }

  function updateStatus(message = lastMessage) {
    if (isClosed()) {
      return;
    }

    lastMessage = message;

    try {
      setContent(status, `Status: ${lastMessage}`);
      setContent(lastKeyText, `Last key: ${lastKey}`);
      setContent(meta, buildSummary());

      const selectedIndex = select.getSelectedIndex();
      select.options = buildActions(state, document.result.variables.length);
      select.setSelectedIndex(Math.min(selectedIndex, select.options.length - 1));
      renderer.requestRender();
    } catch (error) {
      if (isDestroyedTextBufferError(error)) {
        closed = true;
        return;
      }

      throw error;
    }
  }

  function shouldSkipDuplicate(key: string): boolean {
    const now = Date.now();

    if (lastHandledKey === key && now - lastHandledAt < 90) {
      return true;
    }

    lastHandledKey = key;
    lastHandledAt = now;
    return false;
  }

  renderer.root.add(
    Box(
      {
        flexDirection: "column",
        padding: 0,
        gap: 0,
        backgroundColor: "#0B1220",
      },
      Box(
        {
          flexDirection: "column",
          height: previewHeight,
          border: true,
          borderStyle: "rounded",
          borderColor: "#0F766E",
          paddingX: 1,
          title: ` = Preview (${previewHeight - 2} rows) `,
        },
        preview,
      ),
      Box(
        {
          flexDirection: "column",
          height: maskedValuesHeight,
          border: true,
          borderStyle: "rounded",
          borderColor: "#B91C1C",
          paddingX: 1,
          title: " 🔒 Hidden Values ",
        },
        maskedValues,
      ),
      Box(
        {
          flexDirection: "column",
          height: summaryHeight,
          border: true,
          borderStyle: "rounded",
          borderColor: "#16A34A",
          paddingX: 1,
          title: " = Summary ",
        },
        meta,
      ),
      Box(
        {
          flexDirection: "column",
          height: actionsHeight,
          border: true,
          borderStyle: "rounded",
          borderColor: "#64748B",
          paddingX: 1,
          title: " ⚡ Actions ",
        },
        status,
        lastKeyText,
        select,
      ),
    ),
  );

  renderer.focusRenderable(select);
  updateStatus();

  return await new Promise<DashboardResult>((resolve) => {
    function finish(next: DashboardResult) {
      if (closed) {
        return;
      }

      closed = true;
      if (!renderer.isDestroyed) {
        renderer.destroy();
      }

      resolve(next);
    }

    renderer.on(CliRenderEvents.DESTROY, () => {
      if (closed) {
        return;
      }

      closed = true;
      resolve("quit");
    });

    function perform(action: DashboardAction) {
      if (isClosed()) {
        return;
      }

      if (busy) {
        updateStatus("Busy. Wait for the current action to finish.");
        return;
      }

      if (action === "copy") {
        if (document.output.length === 0) {
          updateStatus("Nothing to copy. No variables were found.");
          return;
        }

        busy = true;
        updateStatus("Copying to clipboard...");
        void clipboardy.write(document.output)
          .then(() => {
            if (closed) {
              return;
            }

            busy = false;
            updateStatus("Copied to clipboard.");
          })
          .catch((error: unknown) => {
            if (closed) {
              return;
            }

            busy = false;
            updateStatus(error instanceof Error ? `Clipboard failed: ${error.message}` : "Clipboard failed.");
          });
        return;
      }

      if (action === "save") {
        if (document.output.length === 0) {
          updateStatus("Nothing to save. No variables were found.");
          return;
        }

        busy = true;
        updateStatus(`Saving ${state.outputPath}...`);
        void writeEnvFile(state.outputPath, document.output, state.force)
          .then((resolvedPath) => {
            if (closed) {
              return;
            }

            busy = false;
            updateStatus(`Saved: ${resolvedPath}`);
          })
          .catch((error: unknown) => {
            if (closed) {
              return;
            }

            busy = false;
            updateStatus(error instanceof Error ? error.message : "Save failed.");
          });
        return;
      }

      if (action === "path") {
        finish("path");
        return;
      }

      if (action === "force") {
        state.force = !state.force;
        updateStatus(`Overwrite is now ${state.force ? "ON" : "OFF"}.`);
        return;
      }

      if (action === "replace") {
        finish("replace");
        return;
      }

      finish("quit");
    }

    select.on(SelectRenderableEvents.ITEM_SELECTED, (_index, option) => {
      const action = option?.value as DashboardAction | undefined;

      if (action) {
        lastKey = "Enter";
        updateStatus(`Selected action: ${dashboardActionLabel(action)}`);
        perform(action);
      }
    });

    function handleKey(key: string) {
      if (isClosed()) {
        return true;
      }

      if (key === "\x03") {
        finish("quit");
        return true;
      }

      const normalized = normalizeDashboardKey(key);

      if (!normalized || shouldSkipDuplicate(normalized)) {
        return true;
      }

      lastKey = normalized;

      if (normalized === "up") {
        select.moveUp();
        updateSelectedStatus("Moved up.");
        return true;
      }

      if (normalized === "down") {
        select.moveDown();
        updateSelectedStatus("Moved down.");
        return true;
      }

      if (normalized === "enter") {
        const selected = select.getSelectedOption();
        const selectedAction = selected?.value as DashboardAction | undefined;

        if (selected && selectedAction) {
          updateStatus(`Selected action: ${dashboardActionLabel(selectedAction)}`);
          perform(selectedAction);
        }

        return true;
      }

      const action = dashboardActionFromKey(normalized);

      if (action) {
        updateStatus(`Key received: ${normalized}`);
        perform(action);
        return true;
      }

      updateStatus(`Key received: ${normalized}. Use arrows + Enter, or 1/c, 2/s, 3/o, 4/f, 5/e, q.`);
      return false;
    }

    function updateSelectedStatus(fallback: string) {
      const selected = select.getSelectedOption();
      const selectedAction = selected?.value as DashboardAction | undefined;
      updateStatus(selectedAction ? `Selected action: ${dashboardActionLabel(selectedAction)}` : fallback);
    }

    renderer.prependInputHandler((sequence) => handleKey(sequence));

    renderer.keyInput.on("keypress", (event) => {
      if (event.ctrl && event.name?.toLowerCase() === "c") {
        event.preventDefault();
        event.stopPropagation();
        finish("quit");
        return;
      }

      const handled = handleKey(event.name || event.sequence || "");

      if (handled) {
        event.preventDefault();
        event.stopPropagation();
      }
    });
  });
}
