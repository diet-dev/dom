import { appendChildren, h } from "./h.ts";
import type { Child, Props } from "./h.ts";
import { isSvgTag, svg } from "./svg.ts";
import type { SvgProps } from "./svg.ts";
import type { Component } from "./component.ts";

export interface FragmentProps {
  children?: Child | Child[];
}

function toChildList(children: Child | Child[] | undefined): Child[] {
  return children === undefined ? [] : Array.isArray(children) ? children : [children];
}

export function Fragment(props?: FragmentProps | null): DocumentFragment {
  const frag = document.createDocumentFragment();
  appendChildren(frag, toChildList(props?.children));
  return frag;
}

export namespace JSX {
  export type Element = HTMLElement | SVGElement | DocumentFragment;
  export type ElementType = string | Component<any> | typeof Fragment;
  export interface ElementChildrenAttribute {
    children: unknown;
  }
  export interface IntrinsicAttributes {
    key?: string | number;
    children?: Child | Child[];
  }
  export interface IntrinsicElements {
    [tag: string]: IntrinsicAttributes & Props;
  }
}

export type JsxProps = (Props & { children?: Child | Child[] }) | null | undefined;

export function jsx(tag: JSX.ElementType, props: JsxProps, _key?: string | number): JSX.Element {
  const { children, key: _stripped, ...rest } = props ?? {};
  const list = toChildList(children);
  if (typeof tag === "function") {
    if (tag === Fragment) return Fragment({ children: list });
    const render = tag as (props: unknown, ...children: Child[]) => JSX.Element;
    return render(rest, ...list);
  }
  // SVG-теги создаются в svg-namespace: createElement рисовал бы
  // HTMLUnknownElement, который браузер не рендерит. Поддержка минимальная
  // (закрытый список SVG_TAGS, см. svg.ts) — неизвестные svg-теги и
  // HTML-дети внутри <svg> так и остаются вне поддержки.
  if (isSvgTag(tag)) return svg(tag, rest as SvgProps, ...list);
  return h(tag, rest as Props, ...list);
}

export const jsxs = jsx;
