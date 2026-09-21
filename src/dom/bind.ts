import { effect } from '@preact/signals-core'

const disposers = new WeakMap<Node, Set<() => void>>()

export function bind(node: Node, apply: () => void): void {
  const dispose = effect(apply)
  let set = disposers.get(node)
  if (!set) disposers.set(node, (set = new Set()))
  set.add(dispose)
}

export function unmount(node: Node): void {
  disposeTree(node)
  node.parentNode?.removeChild(node)
}

function disposeTree(node: Node): void {
  const set = disposers.get(node)
  if (set) {
    for (const dispose of set) dispose()
    disposers.delete(node)
  }
  for (const child of Array.from(node.childNodes)) disposeTree(child)
}
