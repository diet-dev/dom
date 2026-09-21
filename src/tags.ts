import { h, splitArgs } from "./h.ts";
import type { Child, Props } from "./h.ts";

export interface Factory {
  (props?: Props | null, ...children: Child[]): HTMLElement;
  (...children: Child[]): HTMLElement;
}

function factory(tag: string): Factory {
  return ((...args: unknown[]) => {
    const [props, children] = splitArgs(args);
    return h(tag, props, ...children);
  }) as Factory;
}

export const el = h;

export const div = factory("div");
export const span = factory("span");
export const section = factory("section");
export const article = factory("article");
export const header = factory("header");
export const footer = factory("footer");
export const main = factory("main");
export const nav = factory("nav");
export const aside = factory("aside");
export const h1 = factory("h1");
export const h2 = factory("h2");
export const h3 = factory("h3");
export const h4 = factory("h4");
export const h5 = factory("h5");
export const h6 = factory("h6");
export const p = factory("p");
export const a = factory("a");
export const strong = factory("strong");
export const em = factory("em");
export const code = factory("code");
export const pre = factory("pre");
export const small = factory("small");
export const blockquote = factory("blockquote");
export const br = factory("br");
export const ul = factory("ul");
export const ol = factory("ol");
export const li = factory("li");
export const form = factory("form");
export const input = factory("input");
export const button = factory("button");
export const label = factory("label");
export const select = factory("select");
export const option = factory("option");
export const textarea = factory("textarea");
export const table = factory("table");
export const thead = factory("thead");
export const tbody = factory("tbody");
export const tr = factory("tr");
export const th = factory("th");
export const td = factory("td");
export const img = factory("img");
