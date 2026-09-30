import { describe, expect, it } from "vitest";
import { h } from "../src/h.ts";
import { div, el, span } from "../src/tags.ts";

describe("h — ядро", () => {
  it("создаёт элемент по тегу", () => {
    expect(h("div")).toBeInstanceOf(HTMLDivElement);
  });

  it("строки и числа становятся текстом", () => {
    const node = h("p", null, "привет", 42);
    expect(node.textContent).toBe("привет42");
  });

  it("узлы вставляются как узлы", () => {
    const child = document.createElement("b");
    const node = h("div", null, child);
    expect(node.firstChild).toBe(child);
  });

  it("массивы разворачиваются на любую глубину", () => {
    const node = h("ul", null, ["a", ["b", [h("li", null, "c")]]]);
    expect(node.textContent).toBe("abc");
  });

  it("null, undefined и false пропускаются", () => {
    const node = h("div", null, "a", null, undefined, false, "b");
    expect(node.textContent).toBe("ab");
  });

  it("0 и NaN — текст, не пропускаются", () => {
    const count = 0;
    expect(h("div", null, count && h("span", null, "x")).textContent).toBe("0");
    expect(h("div", null, NaN).textContent).toBe("NaN");
  });
});

describe("фабрики", () => {
  it("без аргументов", () => {
    expect(div()).toBeInstanceOf(HTMLDivElement);
  });

  it("только дети", () => {
    expect(span("текст").textContent).toBe("текст");
  });

  it("пропсы и дети", () => {
    const node = div({ class: "x" }, span("внутри"));
    expect(node.className).toBe("x");
    expect(node.textContent).toBe("внутри");
  });

  it("el — escape-hatch для любого тега", () => {
    const node = el("progress", { value: 50, max: 100 });
    expect(node.tagName).toBe("PROGRESS");
    expect(node.getAttribute("value")).toBe("50");
  });
});
