import { Signal } from "@preact/signals-core";
import { bind } from "./bind.ts";
import { appendChildren, classToString, domEventName, PROP_NAMES } from "./h.ts";
import type { Child } from "./h.ts";

export const SVG_NS = "http://www.w3.org/2000/svg";
export const XLINK_NS = "http://www.w3.org/1999/xlink";

/**
 * Пропсы svg-узлов. Типизируются общим объектом (как `Props`, не по-тегам):
 * имена атрибутов SVG проверяет браузер, а не компилятор.
 */
export type SvgProps = {
  [key: string]: unknown;
  class?: string | false | (string | false | null | undefined)[];
  className?: string | false | (string | false | null | undefined)[];
  style?: string | Partial<CSSStyleDeclaration>;
} & { [K in `on${string}`]?: EventListener | false };

// Атрибуты, у которых camelCase — родное имя, а не сокращение kebab-case
const KEEP_AS_IS = new Set(["viewBox", "preserveAspectRatio", "viewTarget"]);

export function svg(tag: string, props?: SvgProps | null, ...children: Child[]): SVGElement {
  const el = document.createElementNS(SVG_NS, tag);
  appendChildren(el, children);
  if (props) applySvgProps(el, props);
  return el;
}

export function applySvgProps(el: SVGElement, props: SvgProps): void {
  for (const [key, value] of Object.entries(props)) {
    if (value instanceof Signal) bind(el, () => applySvgProp(el, key, value.value));
    else if (value != null) applySvgProp(el, key, value);
  }
}

export function applySvgProp(el: SVGElement, rawKey: string, value: unknown): void {
  if (rawKey.startsWith("on")) {
    if (typeof value === "function") el.addEventListener(domEventName(el, rawKey), value as EventListener);
    return;
  }
  if (value == null || value === false) {
    el.removeAttribute(propName(rawKey));
    return;
  }
  const key = propName(rawKey);
  // xlink:href исторически нужен старым WebKit/Safari (до Safari 12.1 svg2-href
  // не понимают); современные браузеры понимают и то и другое
  if (key === "href" || key === "xlink:href") {
    el.setAttributeNS(XLINK_NS, "href", String(value));
    return;
  }
  if (key === "class") {
    el.setAttribute("class", classToString(value));
    return;
  }
  // className у SVGElement — readonly SVGAnimatedString, поэтому class всегда
  // идёт через setAttribute
  if (key === "style") {
    if (typeof value === "string") el.setAttribute("style", value);
    else if (value && typeof value === "object") {
      el.style.cssText = "";
      Object.assign(el.style, value);
    }
    return;
  }
  el.setAttribute(key, String(value));
}

function propName(rawKey: string): string {
  const renamed = PROP_NAMES[rawKey] ?? rawKey;
  if (KEEP_AS_IS.has(renamed) || renamed.includes("-")) return renamed;
  return renamed.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
}

const imageCache = new WeakMap<SVGElement, Map<string, Promise<HTMLImageElement>>>();

/**
 * Растеризует svg-узел (или готовую svg-разметку) в HTMLImageElement через
 * Blob-URL. Узел сериализуется по клону: исходник не мутируется. `fill`
 * ставится атрибутом на корень клона — формы без собственного fill
 * наследуют его, а явные дочерние fill не перебиваются.
 *
 * Результат кэшируется по паре (узел, fill): повторные вызовы возвращают
 * тот же промис. Для строкового источника кэша нет.
 *
 * В отличие от остальных функций модуля, промис может быть отклонён
 * (битая разметка, ошибка загрузки) — вызывающий сам решает, критично ли это.
 */
export function svgToImage(source: SVGElement | string, fill?: string): Promise<HTMLImageElement> {
  if (typeof source === "string") return rasterize(source, fill);

  let byFill = imageCache.get(source);
  if (!byFill) imageCache.set(source, (byFill = new Map()));
  const key = fill ?? "";
  let promise = byFill.get(key);
  if (!promise) {
    const clone = source.cloneNode(true) as SVGElement;
    if (fill) clone.setAttribute("fill", fill);
    byFill.set(key, (promise = rasterize(new XMLSerializer().serializeToString(clone), fill)));
  }
  return promise;
}

function rasterize(markup: string, fill?: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    try {
      const blob = new Blob([markup], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(e);
      };
      img.src = url;
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Теги, которые JSX-рантайм создаёт в svg-namespace. Список закрытый:
 * незнакомый тег (`feGaussianBlur`, `animate`, будущие стандарты) попадёт
 * в HTML-namespace и не отрисуется — такие узлы собирайте через svg()
 * и вставляйте готовым элементом.
 */
export const SVG_TAGS: ReadonlySet<string> = new Set([
  "svg",
  "path",
  "g",
  "circle",
  "rect",
  "line",
  "polyline",
  "polygon",
  "ellipse",
  "text",
  "tspan",
  "textPath",
  "defs",
  "use",
  "symbol",
  "marker",
  "clipPath",
  "mask",
  "pattern",
  "linearGradient",
  "radialGradient",
  "stop",
  "filter",
  "image",
  "foreignObject",
]);

export function isSvgTag(tag: string): boolean {
  return SVG_TAGS.has(tag);
}
