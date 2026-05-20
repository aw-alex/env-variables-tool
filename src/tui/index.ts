import { readRawInput } from "./input-screen";
import { runDashboard } from "./dashboard-screen";
import type { DashboardState } from "./types";

function promptLine(question = ""): string {
  return globalThis.prompt(question) ?? "";
}

export async function runTui(prefix: string): Promise<void> {
  let rawInput = await readRawInput(prefix);
  const state: DashboardState = {
    outputPath: ".env",
    force: true,
  };

  while (true) {
    const next = await runDashboard(rawInput, prefix, state);

    if (next === "quit") {
      return;
    }

    if (next === "replace") {
      rawInput = await readRawInput(prefix);
      continue;
    }

    const nextPath = promptLine(`Output path [${state.outputPath}]: `).trim();

    if (nextPath.length > 0) {
      state.outputPath = nextPath;
    }
  }
}
