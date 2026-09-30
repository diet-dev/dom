import { afterEach, describe, expect, it, vi } from "vitest";
import { signal } from "../src/signals.ts";
import { input, select, option, textarea } from "../src/tags.ts";

describe("controlled inputs", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("uncontrolled-старт", () => {
    it("defaultValue задаёт стартовое значение", () => {
      const node = input({ type: "text", defaultValue: "привет" });
      expect((node as HTMLInputElement).value).toBe("привет");
      expect(node.getAttribute("value")).toBeNull();
    });

    it("defaultChecked задаёт стартовое состояние", () => {
      const node = input({ type: "checkbox", defaultChecked: true });
      expect((node as HTMLInputElement).checked).toBe(true);
      expect(node.hasAttribute("checked")).toBe(false);
    });

    it("defaultValue у select применяется после детей", () => {
      const node = select({ defaultValue: "b" }, option({ value: "a" }, "a"), option({ value: "b" }, "b"));
      expect((node as HTMLSelectElement).value).toBe("b");
    });

    it("uncontrolled input можно свободно менять", () => {
      const node = input({ type: "text" });
      (node as HTMLInputElement).value = "руками";
      node.dispatchEvent(new Event("input", { bubbles: true }));
      expect((node as HTMLInputElement).value).toBe("руками");
    });
  });

  describe("controlled с onChange", () => {
    it("value возвращается к prop после события input", () => {
      const node = input({ type: "text", value: "a", onChange: () => {} });
      (node as HTMLInputElement).value = "b";
      node.dispatchEvent(new Event("input", { bubbles: true }));
      expect((node as HTMLInputElement).value).toBe("a");
    });

    it("checked возвращается к prop после события change", () => {
      const node = input({ type: "checkbox", checked: false, onChange: () => {} });
      (node as HTMLInputElement).checked = true;
      node.dispatchEvent(new Event("change", { bubbles: true }));
      expect((node as HTMLInputElement).checked).toBe(false);
    });

    it("onChange получает событие до сброса значения", () => {
      const seen: string[] = [];
      const node = input({ type: "text", value: "a", onChange: () => seen.push((node as HTMLInputElement).value) });
      (node as HTMLInputElement).value = "b";
      node.dispatchEvent(new Event("input", { bubbles: true }));
      expect(seen).toEqual(["b"]);
      expect((node as HTMLInputElement).value).toBe("a");
    });

    it("textarea value контролируется на событии input", () => {
      const node = textarea({ value: "x", onChange: () => {} });
      (node as HTMLTextAreaElement).value = "y";
      node.dispatchEvent(new Event("input", { bubbles: true }));
      expect((node as HTMLTextAreaElement).value).toBe("x");
    });

    it("select value контролируется на событии change", () => {
      const node = select({ value: "a", onChange: () => {} }, option({ value: "a" }, "a"), option({ value: "b" }, "b"));
      (node as HTMLSelectElement).value = "b";
      node.dispatchEvent(new Event("change", { bubbles: true }));
      expect((node as HTMLSelectElement).value).toBe("a");
    });

    it("новый applyProps обновляет сохранённый prop", async () => {
      const { applyProps } = await import("../src/h.ts");
      const node = input({ type: "text", value: "a", onChange: () => {} });
      applyProps(node, { value: "c", onChange: () => {} });
      (node as HTMLInputElement).value = "z";
      node.dispatchEvent(new Event("input", { bubbles: true }));
      expect((node as HTMLInputElement).value).toBe("c");
    });
  });

  describe("read-only без onChange", () => {
    it("value сбрасывается и warns", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const node = input({ type: "text", value: "a" });
      (node as HTMLInputElement).value = "b";
      node.dispatchEvent(new Event("input", { bubbles: true }));
      expect((node as HTMLInputElement).value).toBe("a");
      expect(warn).toHaveBeenCalled();
    });

    it("checked сбрасывается и warns", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const node = input({ type: "checkbox", checked: true });
      (node as HTMLInputElement).checked = false;
      node.dispatchEvent(new Event("change", { bubbles: true }));
      expect((node as HTMLInputElement).checked).toBe(true);
      expect(warn).toHaveBeenCalled();
    });
  });

  describe("Signal — прежний bind, controlled не вмешивается", () => {
    it("Signal value обновляется и не сбрасывается на событии", () => {
      const name = signal("a");
      const node = input({ type: "text", value: name });
      (node as HTMLInputElement).value = "b";
      node.dispatchEvent(new Event("input", { bubbles: true }));
      expect((node as HTMLInputElement).value).toBe("b");
      name.value = "c";
      expect((node as HTMLInputElement).value).toBe("c");
    });

    it("Signal checked обновляется и не сбрасывается на событии", () => {
      const on = signal(false);
      const node = input({ type: "checkbox", checked: on });
      (node as HTMLInputElement).checked = true;
      node.dispatchEvent(new Event("change", { bubbles: true }));
      expect((node as HTMLInputElement).checked).toBe(true);
      on.value = true;
      expect((node as HTMLInputElement).checked).toBe(true);
    });
  });

  describe("value: false — трактуется как «не задано»", () => {
    it("поле не контролируется: ввод не сбрасывается к строке 'false'", () => {
      const node = input({ type: "text", value: false, onChange: () => {} });
      expect((node as HTMLInputElement).value).toBe("");
      (node as HTMLInputElement).value = "typed";
      node.dispatchEvent(new Event("input", { bubbles: true }));
      expect((node as HTMLInputElement).value).toBe("typed");
    });

    it("checked: false остаётся валидным контролируемым значением", () => {
      const node = input({ type: "checkbox", checked: false, onChange: () => {} });
      (node as HTMLInputElement).checked = true;
      node.dispatchEvent(new Event("change", { bubbles: true }));
      expect((node as HTMLInputElement).checked).toBe(false);
    });
  });
});
