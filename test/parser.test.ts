import { describe, expect, test } from "bun:test";
import { extractEnvVariables, formatEnv } from "../src/parser";

describe("extractEnvVariables", () => {
  test("extracts NEXT_PUBLIC variables from timestamped logs", () => {
    const raw = [
      "2026-05-11T16:14:07.5976051Z NEXT_PUBLIC_USE_FEATURE=false",
      "2026-05-11T16:14:07.5976327Z NEXT_PUBLIC_USE_COPILOT=true",
      "2026-05-11T16:14:07.5976620Z NEXT_PUBLIC_USE_ENV=true",
    ].join("\n");

    expect(formatEnv(extractEnvVariables(raw))).toBe([
      "NEXT_PUBLIC_USE_FEATURE=false",
      "NEXT_PUBLIC_USE_COPILOT=true",
      "NEXT_PUBLIC_USE_ENV=true",
    ].join("\n"));
  });

  test("keeps latest duplicate value", () => {
    const result = extractEnvVariables("NEXT_PUBLIC_FLAG=false\nNEXT_PUBLIC_FLAG=true");

    expect(formatEnv(result)).toBe("NEXT_PUBLIC_FLAG=true");
    expect(result.duplicates).toEqual(["NEXT_PUBLIC_FLAG"]);
  });

  test("detects variables with masked values", () => {
    const result = extractEnvVariables([
      "NEXT_PUBLIC_VISIBLE=true",
      "NEXT_PUBLIC_SECRET=***",
      "NEXT_PUBLIC_TOKEN=abc***xyz",
    ].join("\n"));

    expect(result.maskedValueNames).toEqual(["NEXT_PUBLIC_SECRET", "NEXT_PUBLIC_TOKEN"]);
  });
});
