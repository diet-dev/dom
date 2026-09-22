import type { Child, Props } from "./h.ts";
import { splitArgs } from "./h.ts";
import type { JSX } from "./jsx-runtime.ts";

export interface Component<P> {
  (...children: Child[]): JSX.Element;
  (props?: P | null, ...children: Child[]): JSX.Element;
}

export function component<P>(render: (props: P, ...children: Child[]) => JSX.Element): Component<P> {
  return ((...args: unknown[]) => {
    const [props, children] = splitArgs(args);
    return render((props ?? {}) as P, ...children);
  }) as Component<P>;
}
