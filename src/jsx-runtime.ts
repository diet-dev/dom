import { h } from "./h.ts";
import type { Child, Props } from "./h.ts";

export const Fragment = Symbol.for("dom.fragment");

export namespace JSX {
  export type Element = HTMLElement;
  export type ElementType = string;
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

function createElement(tag: string, props: JsxProps, key?: string | number): HTMLElement {
  const { children, ...rest } = props ?? {};
  void key;
  const list = children === undefined ? [] : Array.isArray(children) ? children : [children];
  return h(tag, rest as Props, ...list);
}

export function jsx(tag: string, props: JsxProps, key?: string | number): HTMLElement {
  return createElement(tag, props, key);
}

export const jsxs = jsx;
