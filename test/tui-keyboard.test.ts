import { describe, expect, test } from "bun:test";
import {
  dashboardActionFromKey,
  normalizeDashboardKey,
  normalizeTextareaInput,
} from "../src/tui/keyboard";

describe("tui keyboard helpers", () => {
  test("normalizes textarea paste input", () => {
    expect(normalizeTextareaInput("a\rb\n\tc\x04")).toBe("a\nb\n\tc");
  });

  test("normalizes dashboard navigation keys", () => {
    expect(normalizeDashboardKey("\x1b[A")).toBe("up");
    expect(normalizeDashboardKey("\x1b[B")).toBe("down");
    expect(normalizeDashboardKey("\r")).toBe("enter");
  });

  test("maps direct action keys", () => {
    expect(dashboardActionFromKey("1")).toBe("copy");
    expect(dashboardActionFromKey("s")).toBe("save");
    expect(dashboardActionFromKey("o")).toBe("path");
    expect(dashboardActionFromKey("f")).toBe("force");
    expect(dashboardActionFromKey("e")).toBe("replace");
    expect(dashboardActionFromKey("q")).toBe("quit");
  });
});
