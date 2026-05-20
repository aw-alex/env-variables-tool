import type { DashboardAction } from "./types";

export function normalizeTextareaInput(sequence: string): string {
  let output = "";

  for (const char of sequence) {
    const code = char.charCodeAt(0);

    if (char === "\r") {
      output += "\n";
      continue;
    }

    if (char === "\n" || char === "\t" || code >= 32) {
      output += char;
    }
  }

  return output;
}

export function normalizeDashboardKey(key: string): string {
  if (key === "\x1b[A") return "up";
  if (key === "\x1b[B") return "down";
  if (key === "\r" || key === "\n") return "enter";

  const normalized = key.toLowerCase();

  if (normalized === "up") return "up";
  if (normalized === "down") return "down";
  if (normalized === "enter" || normalized === "return") return "enter";

  return normalized;
}

export function dashboardActionFromKey(key: string): DashboardAction | null {
  const normalized = normalizeDashboardKey(key);

  if (normalized === "1" || normalized === "c") return "copy";
  if (normalized === "2" || normalized === "s") return "save";
  if (normalized === "3" || normalized === "o") return "path";
  if (normalized === "4" || normalized === "f") return "force";
  if (normalized === "5" || normalized === "e") return "replace";
  if (normalized === "q") return "quit";

  return null;
}

export function dashboardActionLabel(action: DashboardAction): string {
  if (action === "copy") return "copy to clipboard";
  if (action === "save") return "save .env file";
  if (action === "path") return "change output path";
  if (action === "force") return "toggle overwrite";
  if (action === "replace") return "paste new raw text";
  return "quit";
}
