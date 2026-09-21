import { jsx } from "./jsx-runtime.ts";
import type { JsxProps } from "./jsx-runtime.ts";

export { jsx, jsxs, Fragment } from "./jsx-runtime.ts";
export type { JsxProps, JSX } from "./jsx-runtime.ts";

export function jsxDEV(
  tag: string,
  props: JsxProps,
  key?: string | number,
  _isStaticChildren?: boolean,
  _source?: unknown,
  _self?: unknown,
): HTMLElement {
  return jsx(tag, props, key);
}
