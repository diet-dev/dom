import { batch, Signal, signal } from "@preact/signals-core";
import { bind, unmount } from "./bind.ts";

export interface ListEntry<T> {
  key: string;
  item: Signal<T>;
  node: Node;
}

export class ListView<T> {
  readonly source: Signal<T[]>;
  readonly keyOf: (item: T) => string;
  readonly render: (item: Signal<T>) => Node;
  #entries: ListEntry<T>[] = [];
  #dupesWarned = new Set<string>();
  #mounted = false;

  constructor(source: Signal<T[]>, keyOf: (item: T) => string, render: (item: Signal<T>) => Node) {
    this.source = source;
    this.keyOf = keyOf;
    this.render = render;
  }

  mount(parent: ParentNode): void {
    if (this.#mounted) throw new Error("ListView is already mounted");
    this.#mounted = true;
    const anchor = document.createComment("list");
    parent.append(anchor);
    bind(anchor, () => this.#reconcile(anchor));
  }

  #reconcile(anchor: Comment): void {
    const parent = anchor.parentNode;
    if (!parent) return;
    batch(() => {
      const items = this.source.value;
      const pending = new Map(this.#entries.map((e) => [e.key, e] as const));
      const next: ListEntry<T>[] = [];
      const seen = new Set<string>();

      for (const item of items) {
        const key = this.keyOf(item);
        if (seen.has(key)) {
          if (!this.#dupesWarned.has(key)) {
            this.#dupesWarned.add(key);
            console.warn(`list: duplicate key "${key}" is ignored (keys must be unique)`);
          }
          continue;
        }
        seen.add(key);
        const existing = pending.get(key);
        if (existing) {
          existing.item.value = item;
          next.push(existing);
          pending.delete(key);
        } else {
          const itemSignal = signal(item);
          next.push({ key, item: itemSignal, node: this.render(itemSignal) });
        }
      }

      for (const entry of pending.values()) unmount(entry.node);

      let cursor: Node = anchor;
      for (let i = next.length - 1; i >= 0; i--) {
        const node = next[i].node;
        if (node === cursor.previousSibling) {
          cursor = node;
          continue;
        }
        parent.insertBefore(node, cursor);
        cursor = node;
      }

      this.#entries = next;
    });
  }
}

export function list<T>(
  source: Signal<T[]>,
  keyOf: (item: T) => string,
  render: (item: Signal<T>) => Node,
): ListView<T> {
  return new ListView(source, keyOf, render);
}
