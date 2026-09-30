import { Signal } from "@preact/signals-core";
import { bind } from "./bind.ts";
import { ListView } from "./list.ts";

export type Child = string | number | Node | Signal<unknown> | ListView<any> | Child[] | null | undefined | false;

export type Props = {
  [key: string]: unknown;
  key?: unknown;
  class?: string | (string | false | null | undefined)[] | Signal<string | null>;
  className?: string | (string | false | null | undefined)[] | Signal<string | null>;
  htmlFor?: string;
  style?: string | Partial<CSSStyleDeclaration> | Signal<string | Partial<CSSStyleDeclaration> | null>;
  dataset?: Record<string, string> | Signal<Record<string, string> | null>;
  ref?: ((el: HTMLElement) => void) | { current: HTMLElement | null };
} & { [K in `on${string}`]?: EventListener };

const PROP_NAMES: Record<string, string> = {
  className: "class",
  htmlFor: "for",
  autoFocus: "autofocus",
};

const EVENT_NAMES: Record<string, string> = {
  onDoubleClick: "dblclick",
};

const CHANGE_AS_INPUT_TYPES = new Set(["checkbox", "radio", "file"]);

type ControlledState = {
  value?: string;
  checked?: boolean;
  hasChange: boolean;
  warned: boolean;
};

const controlledState = new WeakMap<HTMLElement, ControlledState>();

const BOOLEAN_PROPS = new Set([
  "disabled",
  "checked",
  "readOnly",
  "required",
  "selected",
  "multiple",
  "hidden",
  "autofocus",
]);

function normalizeKey(key: string): string | null {
  if (key === "key") return null;
  return PROP_NAMES[key] ?? key;
}

function domEventName(el: HTMLElement, key: string): string {
  if (key === "onChange") {
    if (el.tagName === "INPUT" && !CHANGE_AS_INPUT_TYPES.has(inputType(el))) {
      return "input";
    }
    if (el.tagName === "TEXTAREA") return "input";
    return "change";
  }
  return EVENT_NAMES[key] ?? key.slice(2).toLowerCase();
}

export function h(tag: string, props?: Props | null, ...children: Child[]): HTMLElement {
  const el = document.createElement(tag);
  appendChildren(el, children);
  if (props) applyProps(el, props);
  return el;
}

export function applyProps(el: HTMLElement, props: Props): void {
  const entries = Object.entries(props);
  const typeIndex = entries.findIndex(([key]) => key === "type");
  if (typeIndex > 0) entries.unshift(...entries.splice(typeIndex, 1));
  for (const [key, value] of entries) {
    if (value instanceof Signal) bind(el, () => applyProp(el, key, value.value));
    else if (value != null) applyProp(el, key, value);
  }
  setupControlled(el, props);
}

function isFormControlled(el: HTMLElement): boolean {
  return el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT";
}

function inputType(el: HTMLElement): string {
  return el.getAttribute("type") ?? "";
}

function controlsValue(el: HTMLElement): boolean {
  if (el.tagName === "TEXTAREA" || el.tagName === "SELECT") return true;
  return !CHANGE_AS_INPUT_TYPES.has(inputType(el));
}

function controlsChecked(el: HTMLElement): boolean {
  return el.tagName === "INPUT" && inputType(el) !== "file" && CHANGE_AS_INPUT_TYPES.has(inputType(el));
}

function setupControlled(el: HTMLElement, props: Props): void {
  if (!isFormControlled(el)) return;
  const value = props.value;
  const checked = props.checked;
  const next: ControlledState = { hasChange: props.onChange != null, warned: false };
  let tracked = false;
  if (!(value instanceof Signal) && value != null && controlsValue(el)) {
    next.value = String(value);
    tracked = true;
  }
  if (!(checked instanceof Signal) && checked != null && controlsChecked(el)) {
    next.checked = Boolean(checked);
    tracked = true;
  }
  if (!tracked) {
    controlledState.delete(el);
    return;
  }
  const existed = controlledState.has(el);
  controlledState.set(el, next);
  if (existed) return;
  el.addEventListener(domEventName(el, "onChange"), () => {
    const state = controlledState.get(el);
    if (!state) return;
    if (state.value !== undefined) (el as unknown as Record<string, unknown>).value = state.value;
    if (state.checked !== undefined) (el as unknown as Record<string, unknown>).checked = state.checked;
    if (!state.hasChange && !state.warned) {
      state.warned = true;
      console.warn(
        "You provided a `value` or `checked` prop to a form field without an `onChange` handler. This will render a read-only field.",
      );
    }
  });
}

export function applyProp(el: HTMLElement, rawKey: string, value: unknown): void {
  const key = normalizeKey(rawKey);
  if (key == null) return;
  if (value == null) {
    clearProp(el, key);
    return;
  }
  if (key === "ref") {
    if (typeof value === "function") value(el);
    else if (value && typeof value === "object" && "current" in value) {
      (value as { current: HTMLElement | null }).current = el;
    }
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
    for (const name of Object.keys(el.dataset)) delete el.dataset[name];
    for (const [name, val] of Object.entries(value)) el.dataset[name] = String(val);
    return;
  }
  if (key.startsWith("on") && typeof value === "function") {
    el.addEventListener(domEventName(el, key), value as EventListener);
    return;
  }
  if (key === "defaultValue") {
    (el as unknown as Record<string, unknown>).value = String(value);
    return;
  }
  if (key === "defaultChecked") {
    (el as unknown as Record<string, unknown>).checked = Boolean(value);
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

function clearProp(el: HTMLElement, rawKey: string): void {
  const key = normalizeKey(rawKey);
  if (key == null) return;
  if (key === "class") {
    el.className = "";
    return;
  }
  if (key === "style") {
    el.removeAttribute("style");
    return;
  }
  if (key === "dataset") {
    for (const name of Object.keys(el.dataset)) delete el.dataset[name];
    return;
  }
  if (key === "value") {
    (el as unknown as Record<string, unknown>)[key] = "";
    return;
  }
  if (BOOLEAN_PROPS.has(key)) {
    (el as unknown as Record<string, unknown>)[key] = false;
    return;
  }
  el.removeAttribute(key);
}

function classToString(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.filter(Boolean).join(" ");
  return String(value);
}

function applyStyle(el: HTMLElement, value: unknown): void {
  if (typeof value === "string") el.setAttribute("style", value);
  else if (value && typeof value === "object") {
    el.style.cssText = "";
    Object.assign(el.style, value);
  }
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
  let current: ChildNode | null = null;
  parent.append(marker);
  bind(marker, () => {
    const value = source.value;
    let next: ChildNode | null;
    if (value == null || value === false) next = null;
    else if (value instanceof Node) next = value as ChildNode;
    else next = document.createTextNode(String(value));
    if (next !== current) {
      current?.remove();
      current = next;
      if (next) marker.parentNode?.insertBefore(next, marker);
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
  return propsFirst ? [first as Props, rest as Child[]] : [null, args as Child[]];
}
