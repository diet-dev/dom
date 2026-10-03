import { describe, expect, it, vi } from "vitest";
import { signal } from "../src/signals.ts";
import { unmount } from "../src/bind.ts";
import { SVG_NS, XLINK_NS, applySvgProp, svg, svgToImage } from "../src/svg.ts";

describe("svg — фабрика", () => {
  it("создаёт узел в svg-namespace", () => {
    const node = svg("path");
    expect(node).toBeInstanceOf(SVGElement);
    expect(node.namespaceURI).toBe(SVG_NS);
  });

  it("дети тоже в svg-namespace", () => {
    const node = svg("svg", null, svg("path", { d: "M0 0" }));
    const child = node.firstChild as SVGElement;
    expect(child.namespaceURI).toBe(SVG_NS);
    expect(child.getAttribute("d")).toBe("M0 0");
  });

  it("строки-дети становятся текстом", () => {
    expect(svg("text", null, "привет").textContent).toBe("привет");
  });

  it("camelCase превращается в kebab-case", () => {
    const node = svg("path", { strokeWidth: 4, strokeDasharray: "1 2" });
    expect(node.getAttribute("stroke-width")).toBe("4");
    expect(node.getAttribute("stroke-dasharray")).toBe("1 2");
    expect(node.hasAttribute("strokeWidth")).toBe(false);
  });

  it("viewBox сохраняет регистр", () => {
    const node = svg("svg", { viewBox: "0 0 10 10" });
    expect(node.getAttribute("viewBox")).toBe("0 0 10 10");
    expect(node.hasAttribute("view-box")).toBe(false);
  });

  it("class через setAttribute, а не className", () => {
    const node = svg("svg", { class: "icon big" });
    expect(node.getAttribute("class")).toBe("icon big");
    expect(svg("svg", { className: "x" }).getAttribute("class")).toBe("x");
  });

  it("href уходит в xlink-namespace", () => {
    const node = svg("use", { href: "#star" });
    expect(node.getAttributeNS(XLINK_NS, "href")).toBe("#star");
  });

  it("null и false снимают атрибут", () => {
    const node = svg("path", { d: "M0 0" });
    applySvgProp(node, "d", null);
    expect(node.hasAttribute("d")).toBe(false);
    node.setAttribute("stroke", "red");
    applySvgProp(node, "stroke", false);
    expect(node.hasAttribute("stroke")).toBe(false);
  });

  it("on*-пропсы вешают слушатели", () => {
    const clicked: string[] = [];
    const node = svg("rect", { onClick: () => clicked.push("x") });
    node.dispatchEvent(new MouseEvent("click"));
    expect(clicked).toEqual(["x"]);
  });

  it("сигнальный пропс обновляется и диспозится через unmount", () => {
    const width = signal(2);
    const node = svg("line", { strokeWidth: width });
    expect(node.getAttribute("stroke-width")).toBe("2");
    width.value = 7;
    expect(node.getAttribute("stroke-width")).toBe("7");
    unmount(node);
    width.value = 9;
    expect(node.getAttribute("stroke-width")).toBe("7");
  });
});

describe("svgToImage", () => {
  class FakeImage {
    static last: FakeImage | null = null;
    onload: () => void = () => {};
    onerror: () => void = () => {};
    src = "";
    constructor() {
      FakeImage.last = this;
    }
  }

  it("рисует клон узла и не мутирует источник", async () => {
    const blobs: Blob[] = [];
    vi.stubGlobal("Image", FakeImage);
    vi.stubGlobal("URL", { createObjectURL: (b: Blob) => (blobs.push(b), "blob:fake"), revokeObjectURL: () => {} });

    const source = svg("svg", { viewBox: "0 0 10 10" }, svg("path", { d: "M0 0" }));
    const promise = svgToImage(source, "#fff");
    await Promise.resolve();
    FakeImage.last!.onload();
    await promise;

    const markup = await blobs[0].text();
    expect(markup).toContain('fill="#fff"');
    expect(markup).toContain("<path");
    expect(source.hasAttribute("fill")).toBe(false);

    vi.unstubAllGlobals();
  });

  it("кэширует по паре (узел, fill)", async () => {
    let created = 0;
    vi.stubGlobal("Image", FakeImage);
    vi.stubGlobal("URL", {
      createObjectURL: () => (created++, "blob:fake"),
      revokeObjectURL: () => {},
    });

    const source = svg("svg", null, svg("circle"));
    const first = svgToImage(source, "#fff");
    await Promise.resolve();
    FakeImage.last!.onload();
    await first;

    expect(svgToImage(source, "#fff")).toBe(first);
    expect(created).toBe(1);

    const second = svgToImage(source, "#000");
    expect(second).not.toBe(first);
    expect(created).toBe(2);

    vi.unstubAllGlobals();
  });
});
