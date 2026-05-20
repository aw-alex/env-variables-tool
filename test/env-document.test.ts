import { describe, expect, test } from "bun:test";
import {
  createEnvDocument,
  createMaskedValuesSummary,
  createPreview,
  createRawInputSummary,
} from "../src/env-document";

describe("env document use case", () => {
  test("creates extracted env output and metadata", () => {
    const raw = [
      "2026-05-11T16:14:07.5976051Z NEXT_PUBLIC_USE_FEATURE=false",
      "2026-05-11T16:14:07.5976327Z NEXT_PUBLIC_USE_COPILOT=true",
    ].join("\n");

    const document = createEnvDocument(raw, "NEXT_PUBLIC_");

    expect(document.output).toBe("NEXT_PUBLIC_USE_FEATURE=false\nNEXT_PUBLIC_USE_COPILOT=true");
    expect(document.result.variables).toHaveLength(2);
  });

  test("builds input summary without storing raw values", () => {
    const summary = createRawInputSummary("NEXT_PUBLIC_FLAG=true\nignored", "NEXT_PUBLIC_");

    expect(summary).toEqual({
      charCount: 29,
      lineCount: 2,
      variableCount: 1,
    });
  });

  test("builds a no-results preview", () => {
    expect(createPreview("NO_PUBLIC_FLAG=true", "NEXT_PUBLIC_")).toBe("No variables found for prefix NEXT_PUBLIC_");
  });

  test("builds a masked values summary", () => {
    const document = createEnvDocument("NEXT_PUBLIC_VISIBLE=true\nNEXT_PUBLIC_SECRET=***", "NEXT_PUBLIC_");

    expect(createMaskedValuesSummary(document)).toBe("NEXT_PUBLIC_SECRET");
  });
});
