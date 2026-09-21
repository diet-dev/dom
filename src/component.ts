import type { Child, Props } from "./h.ts";
import { splitArgs } from "./h.ts";

export interface Component<P> {
  (props?: P | null, ...children: Child[]): HTMLElement;
  (...children: Child[]): HTMLElement;
}

export function component<P>(
  render: (props: P, ...children: Child[]) => HTMLElement,
): Component<P> {
  return ((...args: unknown[]) => {
    const [props, children] = splitArgs(args);
    return render((props ?? {}) as P, ...children);
  }) as Component<P>;
}
