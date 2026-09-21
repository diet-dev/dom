import { describe, expect, it } from "vitest";
import { signal } from "../src/signals.ts";
import { div, input, button, select, option, textarea, label } from "../src/tags.ts";

describe("пропсы", () => {
  it("class: строка", () => {
    expect(div({ class: "a b" }).className).toBe("a b");
  });

  it("class: массив собирает только truthy", () => {
    const flag = false;
    expect(div({ class: ["a", flag && "b", null, undefined, "c"] }).className).toBe("a c");
  });

  it("style: строка", () => {
    expect(div({ style: "color: red" }).getAttribute("style")).toBe("color: red");
  });

  it("style: объект", () => {
    const node = div({ style: { fontSize: "14px", color: "red" } });
    expect(node.style.fontSize).toBe("14px");
    expect(node.style.color).toBe("red");
  });

  it("dataset", () => {
    expect(div({ dataset: { userId: "7" } }).dataset.userId).toBe("7");
    expect(div({ dataset: { userId: "7" } }).getAttribute("data-user-id")).toBe("7");
  });

  it("on* навешивает обработчик события", () => {
    let clicked = 0;
    const node = button({ onclick: () => clicked++ });
    node.click();
    expect(clicked).toBe(1);
  });

  it("value — свойство, не атрибут", () => {
    const node = input({ value: "текст" });
    expect((node as HTMLInputElement).value).toBe("текст");
    expect(node.getAttribute("value")).toBeNull();
  });

  it("булевы пропсы — свойства", () => {
    const node = button({ disabled: false });
    expect((node as HTMLButtonElement).disabled).toBe(false);
    expect(node.getAttribute("disabled")).toBeNull();
    const off = button({ disabled: true });
    expect((off as HTMLButtonElement).disabled).toBe(true);
    expect(off.hasAttribute("disabled")).toBe(true);
  });

  it("прочие — атрибуты", () => {
    const node = input({ type: "text", placeholder: "имя", id: "name" });
    expect(node.getAttribute("type")).toBe("text");
    expect(node.getAttribute("placeholder")).toBe("имя");
    expect(node.getAttribute("id")).toBe("name");
  });

  it("ref вызывается с элементом", () => {
    let captured: HTMLElement | null = null;
    const node = div({ ref: (el) => (captured = el) });
    expect(captured).toBe(node);
  });

  it("readOnly выставляет свойство и атрибут", () => {
    const node = input({ type: "text", readOnly: true });
    expect((node as HTMLInputElement).readOnly).toBe(true);
    expect(node.hasAttribute("readonly")).toBe(true);
    const off = input({ type: "text", readOnly: false });
    expect((off as HTMLInputElement).readOnly).toBe(false);
    expect(off.getAttribute("readonly")).toBeNull();
  });

  it("value у select применяется после монтирования детей", () => {
    const node = select({ value: "b" }, option({ value: "a" }, "a"), option({ value: "b" }, "b"));
    expect((node as HTMLSelectElement).value).toBe("b");
  });

  describe("React-контракт имён", () => {
    it("className → class", () => {
      expect(div({ className: "a b" }).className).toBe("a b");
    });

    it("htmlFor → for", () => {
      expect(label({ htmlFor: "name" }).getAttribute("for")).toBe("name");
    });

    it("key игнорируется и не становится атрибутом", () => {
      const node = div({ key: "1", class: "a" });
      expect(node.getAttribute("key")).toBeNull();
      expect(node.hasAttribute("key")).toBe(false);
    });

    it("onDoubleClick → dblclick", () => {
      let fired = 0;
      const node = button({ onDoubleClick: () => fired++ });
      node.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
      expect(fired).toBe(1);
    });

    it("onChange у текстового input → событие input", () => {
      let fired = 0;
      const node = input({ type: "text", onChange: () => fired++ });
      node.dispatchEvent(new Event("input", { bubbles: true }));
      expect(fired).toBe(1);
      node.dispatchEvent(new Event("change", { bubbles: true }));
      expect(fired).toBe(1);
    });

    it("onChange у number input → событие input", () => {
      let fired = 0;
      const node = input({ type: "number", onChange: () => fired++ });
      node.dispatchEvent(new Event("input", { bubbles: true }));
      expect(fired).toBe(1);
    });

    it("onChange у textarea → событие input", () => {
      let fired = 0;
      const node = textarea({ onChange: () => fired++ });
      node.dispatchEvent(new Event("input", { bubbles: true }));
      expect(fired).toBe(1);
    });

    it("onChange у select → событие change", () => {
      let fired = 0;
      const node = select({ onChange: () => fired++ }, option({ value: "a" }, "a"));
      node.dispatchEvent(new Event("change", { bubbles: true }));
      expect(fired).toBe(1);
      node.dispatchEvent(new Event("input", { bubbles: true }));
      expect(fired).toBe(1);
    });

    it.each(["checkbox", "radio", "file"])("onChange у input[type=%s] → событие change", (type) => {
      let fired = 0;
      const node = input({ type, onChange: () => fired++ });
      node.dispatchEvent(new Event("change", { bubbles: true }));
      expect(fired).toBe(1);
      node.dispatchEvent(new Event("input", { bubbles: true }));
      expect(fired).toBe(1);
    });

    it("autoFocus → autofocus", () => {
      const node = input({ type: "text", autoFocus: true });
      expect(node.hasAttribute("autofocus")).toBe(true);
    });

    it("onChange до type в пропсах всё равно вешается на change для checkbox", () => {
      let fired = 0;
      const node = input({ onChange: () => fired++, type: "checkbox" });
      node.dispatchEvent(new Event("change", { bubbles: true }));
      expect(fired).toBe(1);
      node.dispatchEvent(new Event("input", { bubbles: true }));
      expect(fired).toBe(1);
    });

    it("readOnly — React-имя выставляет свойство и атрибут", () => {
      const node = input({ type: "text", readOnly: true });
      expect((node as HTMLInputElement).readOnly).toBe(true);
      expect(node.hasAttribute("readonly")).toBe(true);
    });

    it("ref принимает объект { current }", () => {
      const ref = { current: null as HTMLElement | null };
      const node = div({ ref });
      expect(ref.current).toBe(node);
    });

    it("прочие React-события лоуэрятся", () => {
      const heard: string[] = [];
      const node = div({
        onMouseEnter: () => heard.push("enter"),
        onKeyDown: () => heard.push("key"),
        onSubmit: () => heard.push("submit"),
        onFocus: () => heard.push("focus"),
        onBlur: () => heard.push("blur"),
      });
      node.dispatchEvent(new MouseEvent("mouseenter"));
      node.dispatchEvent(new KeyboardEvent("keydown"));
      node.dispatchEvent(new Event("submit"));
      node.dispatchEvent(new FocusEvent("focus"));
      node.dispatchEvent(new FocusEvent("blur"));
      expect(heard).toEqual(["enter", "key", "submit", "focus", "blur"]);
    });
  });

  it("Signal-проп, изменившийся на null, очищает DOM-состояние", () => {
    const placeholder = signal<string | null>("имя");
    const node = input({ type: "text", placeholder });
    expect(node.getAttribute("placeholder")).toBe("имя");
    placeholder.value = null;
    expect(node.getAttribute("placeholder")).toBeNull();

    const cls = signal<string | null>("a");
    const nodeClass = div({ class: cls });
    expect(nodeClass.className).toBe("a");
    cls.value = null;
    expect(nodeClass.className).toBe("");

    const disabled = signal<boolean | null>(true);
    const nodeButton = button({ disabled });
    expect((nodeButton as HTMLButtonElement).disabled).toBe(true);
    disabled.value = null;
    expect((nodeButton as HTMLButtonElement).disabled).toBe(false);

    const data = signal<Record<string, string> | null>({ userId: "7" });
    const nodeData = div({ dataset: data });
    expect(nodeData.getAttribute("data-user-id")).toBe("7");
    data.value = null;
    expect(nodeData.getAttribute("data-user-id")).toBeNull();
    expect(nodeData.getAttribute("dataset")).toBeNull();
  });
});
