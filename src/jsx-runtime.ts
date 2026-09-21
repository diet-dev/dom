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

export function jsx(tag: string, props: JsxProps, _key?: string | number): HTMLElement {
  const { children, key: _stripped, ...rest } = props ?? {};
  const list = children === undefined ? [] : Array.isArray(children) ? children : [children];
  return h(tag, rest as Props, ...list);
}

export const jsxs = jsx;
