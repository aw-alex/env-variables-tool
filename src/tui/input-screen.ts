import {
  Box,
  TextareaRenderable,
  TextRenderable as OpenTuiText,
  createCliRenderer,
} from "@opentui/core";
import { createRawInputSummary } from "../env-document";
import { normalizeTextareaInput } from "./keyboard";
import { setContent } from "./renderable";

export async function readRawInput(prefix: string): Promise<string> {
  const renderer = await createCliRenderer({
    exitOnCtrlC: true,
    targetFps: 30,
    backgroundColor: "#0B1220",
  });

  const screenHeight = Math.max(
    renderer.height || process.stdout.rows || 24,
    24,
  );
  const headerHeight = 3;
  const controlsHeight = 3;
  const statusHeight = 3;
  const editorBoxHeight = Math.max(
    8,
    screenHeight - headerHeight - controlsHeight - statusHeight,
  );

  const controlText = new OpenTuiText(renderer, {
    content: "✅ Ctrl+D confirm and open the preview. 🚪 Ctrl+C exit",
    fg: "#f0f026",
    height: 1,
    truncate: true,
  });

  const stats = new OpenTuiText(renderer, {
    content: "Waiting for raw text...",
    fg: "#A7F3D0",
    height: 1,
    truncate: true,
  });

  const help = new OpenTuiText(renderer, {
    content:
      "📝 Use the textarea normally: paste, type, delete, move cursor. Values stay only in process memory.",
    fg: "#93C5FD",
    height: 1,
    truncate: true,
  });

  const textarea = new TextareaRenderable(renderer, {
    width: "100%",
    height: Math.max(1, editorBoxHeight - 2),
    placeholder:
      "Paste raw text here...\n\nExample:\n2026-05-11T16:14:07.5976327Z NEXT_PUBLIC_USE_FEATURE=true",
    placeholderColor: "#64748B",
    backgroundColor: "#0F172A",
    textColor: "#E5E7EB",
    focusedBackgroundColor: "#0F172A",
    focusedTextColor: "#F8FAFC",
    cursorColor: "#67E8F9",
    cursorStyle: { style: "line", blinking: true },
    wrapMode: "char",
    scrollMargin: 2,
    onContentChange: () => {
      updateStats();
    },
  });

  function updateStats() {
    const summary = createRawInputSummary(textarea.plainText, prefix);
    setContent(
      stats,
      `🔎 Captured ${summary.charCount} chars  •  ${summary.lineCount} lines  •  ${summary.variableCount} ${prefix} variable(s) detected`,
    );
    renderer.requestRender();
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
          height: headerHeight,
          border: true,
          borderStyle: "rounded",
          borderColor: "#A7F3D0",
          paddingX: 1,
          title: " = ENV-VARIABLES-TOOL",
        },
        help,
      ),
      Box(
        {
          flexDirection: "column",
          height: editorBoxHeight,
          border: true,
          borderStyle: "rounded",
          borderColor: "#0F766E",
          paddingX: 1,
          title: " Raw Text ",
        },
        textarea,
      ),
      Box(
        {
          flexDirection: "column",
          height: controlsHeight,
          border: true,
          borderStyle: "rounded",
          borderColor: "#f0f026",
          paddingX: 1,
          title: " ⌨ Controls ",
        },
        controlText,
      ),
      Box(
        {
          flexDirection: "column",
          height: statusHeight,
          border: true,
          borderStyle: "rounded",
          borderColor: "#64748B",
          paddingX: 1,
          title: " ⌨ Status ",
        },
        stats,
        // help,
      ),
    ),
  );

  renderer.focusRenderable(textarea);
  updateStats();

  return await new Promise((resolve) => {
    let finished = false;

    function finish() {
      if (finished) {
        return;
      }

      finished = true;
      const raw = textarea.plainText.trimEnd();
      renderer.destroy();
      resolve(raw);
    }

    renderer.prependInputHandler((sequence) => {
      if (sequence === "\x04") {
        finish();
        return true;
      }

      if (
        sequence === "\x03" ||
        sequence === "\x7f" ||
        sequence === "\b" ||
        sequence.startsWith("\x1b")
      ) {
        return false;
      }

      const text = normalizeTextareaInput(sequence);

      if (text.length > 0) {
        textarea.insertText(text);
        updateStats();
        return true;
      }

      return false;
    });

    renderer.keyInput.on("keypress", (event) => {
      if (event.ctrl && event.name.toLowerCase() === "d") {
        event.preventDefault();
        event.stopPropagation();
        finish();
      }
    });
  });
}
