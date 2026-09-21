// @vitest-environment node
import { describe, expect, it } from "vitest";

describe("SSR-безопасность рантайма", () => {
  it("импорт jsx-runtime не трогает document", async () => {
    expect(typeof document).toBe("undefined");
    const runtime = await import("../src/jsx-runtime.ts");
    expect(typeof runtime.jsx).toBe("function");
    expect(typeof runtime.jsxs).toBe("function");
    expect(runtime.Fragment).toBeDefined();
  });

  it("импорт jsx-dev-runtime не трогает document", async () => {
    expect(typeof document).toBe("undefined");
    const runtime = await import("../src/jsx-dev-runtime.ts");
    expect(typeof runtime.jsxDEV).toBe("function");
  });
});
