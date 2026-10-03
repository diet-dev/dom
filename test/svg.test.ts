import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { signal } from "../src/signals.ts";
import { unmount } from "../src/bind.ts";
import { list } from "../src/list.ts";
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

  it("preserveAspectRatio и viewTarget тоже сохраняют регистр", () => {
    const node = svg("svg", { preserveAspectRatio: "xMidYMid meet", viewTarget: "#map" });
    expect(node.getAttribute("preserveAspectRatio")).toBe("xMidYMid meet");
    expect(node.getAttribute("viewTarget")).toBe("#map");
    expect(node.hasAttribute("preserve-aspect-ratio")).toBe(false);
  });

  it("style строкой и объектом", () => {
    const byString = svg("rect", { style: "fill: red" });
    expect(byString.getAttribute("style")).toBe("fill: red");

    const byObject = svg("rect", { style: { fill: "blue", strokeWidth: "3" } });
    expect(byObject.getAttribute("style")).toContain("fill: blue");
    expect(byObject.getAttribute("style")).toContain("stroke-width: 3");
  });

  it("сигнальный class обновляется и диспозится через unmount", () => {
    const cls = signal("a");
    const node = svg("rect", { class: cls });
    expect(node.getAttribute("class")).toBe("a");
    cls.value = "b";
    expect(node.getAttribute("class")).toBe("b");
    unmount(node);
    cls.value = "c";
    expect(node.getAttribute("class")).toBe("b");
  });

  it("сигнал-ребёнок обновляется", () => {
    const text = signal("привет");
    const node = svg("text", null, text);
    expect(node.textContent).toBe("привет");
    text.value = "пока";
    expect(node.textContent).toBe("пока");
    unmount(node);
    text.value = "уходи";
    expect(node.textContent).toBe("пока");
  });

  it("list() как ребёнок svg", () => {
    const items = signal(["a", "b"]);
    const node = svg(
      "g",
      null,
      list(
        items,
        (x) => x,
        (x) => svg("text", null, x),
      ),
    );
    expect(node.querySelectorAll("text").length).toBe(2);
    items.value = ["a"];
    expect(node.querySelectorAll("text").length).toBe(1);
    unmount(node);
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

  it("имена событий совпадают с h(): onDoubleClick -> dblclick, onChange -> change", () => {
    const events: string[] = [];
    const node = svg("rect", {
      onDoubleClick: () => events.push("dblclick"),
      onChange: () => events.push("change"),
    });
    node.dispatchEvent(new MouseEvent("dblclick"));
    node.dispatchEvent(new Event("change"));
    expect(events).toEqual(["dblclick", "change"]);
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
    onerror: (e: unknown) => void = () => {};
    src = "";
    constructor() {
      FakeImage.last = this;
    }
  }

  const blobs: Blob[] = [];
  let created = 0;

  beforeEach(() => {
    blobs.length = 0;
    created = 0;
    vi.stubGlobal("Image", FakeImage);
    vi.stubGlobal("URL", {
      createObjectURL: (b: Blob) => {
        blobs.push(b);
        return `blob:fake#${created++}`;
      },
      revokeObjectURL: () => {},
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  async function flushLoad(): Promise<void> {
    await Promise.resolve();
    FakeImage.last!.onload();
  }

  it("рисует клон узла и не мутирует источник", async () => {
    const source = svg("svg", { viewBox: "0 0 10 10" }, svg("path", { d: "M0 0" }));
    const promise = svgToImage(source, "#fff");
    await flushLoad();
    await promise;

    const markup = await blobs[0].text();
    expect(markup).toContain('fill="#fff"');
    expect(markup).toContain("<path");
    expect(source.hasAttribute("fill")).toBe(false);
  });

  it("кэширует по паре (узел, fill)", async () => {
    const source = svg("svg", null, svg("circle"));
    const first = svgToImage(source, "#fff");
    await flushLoad();
    await first;

    expect(svgToImage(source, "#fff")).toBe(first);
    expect(created).toBe(1);

    const second = svgToImage(source, "#000");
    expect(second).not.toBe(first);
    expect(created).toBe(2);
  });

  it("строковый источник не кэшируется", async () => {
    const markup = '<svg xmlns="http://www.w3.org/2000/svg"><circle/></svg>';
    const first = svgToImage(markup);
    await flushLoad();
    await first;

    const second = svgToImage(markup);
    expect(second).not.toBe(first);
    expect(created).toBe(2);
  });

  it("промис отклоняется при ошибке загрузки", async () => {
    const source = svg("svg", null, svg("circle"));
    const promise = svgToImage(source);
    await Promise.resolve();
    const failure = new Event("error");
    FakeImage.last!.onerror(failure);
    await expect(promise).rejects.toBe(failure);
    expect(created).toBe(1);
  });
});
