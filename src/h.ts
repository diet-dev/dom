import { Signal } from "@preact/signals-core";
import { bind } from "./bind.ts";
import { ListView } from "./list.ts";

export type Child =
  | string
  | number
  | Node
  | Signal<unknown>
  | ListView<any>
  | Child[]
  | null
  | undefined
  | false;

export type Props = {
  [key: string]: unknown;
  class?: string | (string | false | null | undefined)[] | Signal<string>;
  style?: string | Partial<CSSStyleDeclaration>;
  dataset?: Record<string, string>;
  ref?: (el: HTMLElement) => void;
} & { [K in `on${string}`]?: EventListener };

const BOOLEAN_PROPS = new Set([
  "disabled",
  "checked",
  "readonly",
  "required",
  "selected",
  "multiple",
  "autofocus",
  "hidden",
]);

export function h(
  tag: string,
  props?: Props | null,
  ...children: Child[]
): HTMLElement {
  const el = document.createElement(tag);
  if (props) applyProps(el, props);
  appendChildren(el, children);
  return el;
}

export function applyProps(el: HTMLElement, props: Props): void {
  for (const [key, value] of Object.entries(props)) {
    if (value instanceof Signal)
      bind(el, () => applyProp(el, key, value.value));
    else applyProp(el, key, value);
  }
}

export function applyProp(el: HTMLElement, key: string, value: unknown): void {
  if (value == null) return;
  if (key === "ref" && typeof value === "function") {
    value(el);
    return;
  }
  if (key === "class") {
    el.className = classToString(value);
    return;
  }
  if (key === "style") {
    applyStyle(el, value);
    return;
  }
  if (key === "dataset" && typeof value === "object") {
    for (const [name, val] of Object.entries(value))
      el.dataset[name] = String(val);
    return;
  }
  if (key.startsWith("on") && typeof value === "function") {
    el.addEventListener(key.slice(2).toLowerCase(), value as EventListener);
    return;
  }
  if (key === "value") {
    (el as unknown as Record<string, unknown>)[key] = String(value);
    return;
  }
  if (BOOLEAN_PROPS.has(key)) {
    (el as unknown as Record<string, unknown>)[key] = Boolean(value);
    return;
  }
  el.setAttribute(key, String(value));
}

function classToString(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.filter(Boolean).join(" ");
  return String(value);
}

function applyStyle(el: HTMLElement, value: unknown): void {
  if (typeof value === "string") el.setAttribute("style", value);
  else if (value && typeof value === "object") Object.assign(el.style, value);
}

export function appendChildren(el: ParentNode, children: Child[]): void {
  for (const child of children) {
    if (child == null || child === false) continue;
    if (Array.isArray(child)) {
      appendChildren(el, child);
      continue;
    }
    if (child instanceof ListView) {
      child.mount(el);
      continue;
    }
    if (child instanceof Signal) {
      bindChildSignal(el, child);
      continue;
    }
    el.append(child instanceof Node ? child : String(child));
  }
}

function bindChildSignal(parent: ParentNode, source: Signal<unknown>): void {
  const marker = document.createTextNode("");
  let current: ChildNode = marker;
  parent.append(marker);
  bind(parent, () => {
    const value = source.value;
    let next: ChildNode;
    if (value == null || value === false) next = marker;
    else if (value instanceof Node) next = value as ChildNode;
    else next = document.createTextNode(String(value));
    if (next !== current) {
      current.replaceWith(next);
      current = next;
    }
  });
}

export function splitArgs(args: unknown[]): [Props | null, Child[]] {
  const [first, ...rest] = args;
  const propsFirst =
    first == null ||
    (typeof first === "object" &&
      !(first instanceof Node) &&
      !(first instanceof Signal) &&
      !(first instanceof ListView) &&
      !Array.isArray(first));
  return propsFirst
    ? [first as Props, rest as Child[]]
    : [null, args as Child[]];
}
