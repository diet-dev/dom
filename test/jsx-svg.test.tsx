import { describe, expect, it } from "vitest";
import { SVG_NS } from "../src/svg.ts";
import { jsxDEV } from "../src/jsx-dev-runtime.ts";

describe("JSX — svg", () => {
  it("<svg> и дети создаются в svg-namespace", () => {
    const node = (
      <svg viewBox="0 0 10 10">
        <path d="M0 0" />
      </svg>
    ) as unknown as Element;
    expect(node.namespaceURI).toBe(SVG_NS);
    expect(node.getAttribute("viewBox")).toBe("0 0 10 10");
    const child = node.firstChild as SVGElement;
    expect(child.namespaceURI).toBe(SVG_NS);
    expect(child.getAttribute("d")).toBe("M0 0");
  });

  it("camelCase-атрибуты уходят в kebab-case", () => {
    const node = (<circle strokeWidth={4} />) as unknown as Element;
    expect(node.getAttribute("stroke-width")).toBe("4");
  });

  it("onClick на svg-узле работает", () => {
    let clicks = 0;
    const node = (<rect onClick={() => clicks++} />) as unknown as Element;
    node.dispatchEvent(new MouseEvent("click"));
    expect(clicks).toBe(1);
  });

  it("jsxDEV ведёт себя так же", () => {
    const node = jsxDEV("svg", { viewBox: "0 0 1 1" }) as SVGElement;
    expect(node.namespaceURI).toBe(SVG_NS);
  });

  it("HTML-теги по-прежнему в HTML-namespace", () => {
    const node = (<div />) as unknown as Element;
    expect(node.namespaceURI).toBe("http://www.w3.org/1999/xhtml");
  });
});
