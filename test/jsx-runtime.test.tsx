import { describe, expect, it, vi } from "vitest";
import { signal } from "../src/signals.ts";

describe("JSX-рантайм (автоматический)", () => {
  it('<div className="x" onClick={...}> рендерит корректный DOM', () => {
    const onClick = vi.fn();
    const node = (
      <div className="x" onClick={onClick}>
        <span>привет</span> мир
      </div>
    ) as HTMLElement;
    expect(node.tagName).toBe("DIV");
    expect(node.className).toBe("x");
    expect(node.childNodes).toHaveLength(2);
    expect(node.firstChild?.textContent).toBe("привет");
    expect(node.lastChild?.textContent).toBe(" мир");
    node.dispatchEvent(new MouseEvent("click"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("htmlFor → for", () => {
    const node = (
      <label htmlFor="name">
        <input id="name" type="text" value="текст" />
      </label>
    ) as HTMLElement;
    expect(node.getAttribute("for")).toBe("name");
    expect((node.firstChild as HTMLInputElement).value).toBe("текст");
  });

  it("key отрезается и не становится атрибутом", () => {
    const node = (<li key="a">элемент</li>) as HTMLElement;
    expect(node.getAttribute("key")).toBeNull();
    expect(node.tagName).toBe("LI");
  });

  it("key вырезается из props и при явном вызове jsx", async () => {
    const { jsx } = await import("../src/jsx-runtime.ts");
    const node = jsx("li", { key: "a", children: "элемент" }, "a") as HTMLElement;
    expect(node.getAttribute("key")).toBeNull();
    expect(node.textContent).toBe("элемент");
  });

  it("props.children распаковывается (jsxs для статики)", async () => {
    const { jsxs } = await import("../src/jsx-runtime.ts");
    const node = jsxs("ul", { children: [<li key="1">один</li>, <li key="2">два</li>] }) as HTMLElement;
    expect(node.tagName).toBe("UL");
    expect(node.children).toHaveLength(2);
    expect(node.children[0].textContent).toBe("один");
    expect(node.children[1].textContent).toBe("два");
  });

  it("Signal как child реактивно обновляется", () => {
    const name = signal("Аня");
    const node = <p>Привет, {name}!</p>;
    expect(node.textContent).toBe("Привет, Аня!");
    name.value = "Борис";
    expect(node.textContent).toBe("Привет, Борис!");
  });

  it("jsxDEV проксирует в jsx", async () => {
    const { jsxDEV } = await import("../src/jsx-dev-runtime.ts");
    const node = jsxDEV(
      "button",
      { type: "button", disabled: true, children: "ок" },
      undefined,
      false,
      undefined,
      undefined,
    ) as HTMLElement;
    expect(node.tagName).toBe("BUTTON");
    expect((node as HTMLButtonElement).disabled).toBe(true);
    expect(node.textContent).toBe("ок");
  });

  it("Fragment экспортируется", async () => {
    const { Fragment } = await import("../src/jsx-runtime.ts");
    expect(Fragment).toBeDefined();
  });

  it("JSX namespace доступен без глобальных деклараций (типизация)", () => {
    const node = (<custom-tag data-x="1">текст</custom-tag>) as HTMLElement;
    expect(node.tagName).toBe("CUSTOM-TAG");
    expect(node.getAttribute("data-x")).toBe("1");
  });
});
