import { describe, expect, it } from 'vitest'
import { signal } from './signals.ts'
import { div, input, span } from './tags.ts'
import { unmount } from './bind.ts'

describe('реактивные дети', () => {
  it('текст обновляется при изменении signal', () => {
    const count = signal(0)
    const node = div('Кликов: ', count)
    expect(node.textContent).toBe('Кликов: 0')
    count.value = 5
    expect(node.textContent).toBe('Кликов: 5')
  })

  it('Signal с Node заменяет узел, null возвращает маркер', () => {
    const view = signal<Node | null>(span('показано'))
    const node = div(view)
    const shown = node.firstChild
    expect(shown).toBeInstanceOf(HTMLSpanElement)
    view.value = null
    expect(node.childNodes.length).toBe(1)
    expect(node.textContent).toBe('')
    view.value = span('снова')
    expect(node.textContent).toBe('снова')
    expect(node.firstChild).not.toBe(shown)
  })
})

describe('реактивные пропсы', () => {
  it('class обновляется', () => {
    const cls = signal('a')
    const node = div({ class: cls })
    expect(node.className).toBe('a')
    cls.value = 'b c'
    expect(node.className).toBe('b c')
  })

  it('value на input обновляется', () => {
    const value = signal('до')
    const node = input({ value })
    expect((node as HTMLInputElement).value).toBe('до')
    value.value = 'после'
    expect((node as HTMLInputElement).value).toBe('после')
  })

  it('disabled обновляется', () => {
    const busy = signal(false)
    const node = div({ id: 'x' }, undefined)
    expect(node.id).toBe('x')
    const btn = input({ disabled: busy })
    expect((btn as HTMLInputElement).disabled).toBe(false)
    busy.value = true
    expect((btn as HTMLInputElement).disabled).toBe(true)
  })
})

describe('unmount', () => {
  it('диспозит эффекты поддерева и удаляет узел', () => {
    const text = signal('раз')
    const inner = div(text)
    const root = div(inner)
    document.body.append(root)

    expect(inner.textContent).toBe('раз')
    unmount(root)
    expect(root.parentNode).toBeNull()

    text.value = 'два'
    expect(inner.textContent).toBe('раз')
  })

  it('до unmount обновления продолжаются', () => {
    const text = signal('до')
    const node = div(text)
    document.body.append(node)
    text.value = 'после'
    expect(node.textContent).toBe('после')
    unmount(node)
  })
})
