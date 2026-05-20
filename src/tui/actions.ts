import type { SelectOption } from "@opentui/core";
import type { DashboardState } from "./types";

export function buildActions(state: DashboardState, foundCount: number): SelectOption[] {
  return [
    {
      name: "📋  1 / c  Copy to clipboard",
      description: "Copy extracted variables to your system clipboard.",
      value: "copy",
    },
    {
      name: `💾  2 / s  Save .env file -> ${state.outputPath}`,
      description: `Save file. Overwrite: ${state.force ? "ON" : "OFF"}.`,
      value: "save",
    },
    {
      name: "📁  3 / o  Change output path",
      description: `Current path: ${state.outputPath}.`,
      value: "path",
    },
    {
      name: `🔁  4 / f  Overwrite: ${state.force ? "ON" : "OFF"}`,
      description: "Toggle overwrite for existing files.",
      value: "force",
    },
    {
      name: `📥  5 / e  Paste new raw text (${foundCount} found)`,
      description: "Replace the current raw text.",
      value: "replace",
    },
    {
      name: "🚪  q  Quit",
      description: "q exits without writing anything else.",
      value: "quit",
    },
  ];
}
