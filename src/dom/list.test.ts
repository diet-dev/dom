import { describe, expect, it } from 'vitest'
import { computed, signal } from './signals.ts'
import { list } from './list.ts'
import { div, li, ul } from './tags.ts'
import { unmount } from './bind.ts'

interface Todo {
  id: number
  text: string
}

function setup(initial: Todo[]) {
  const source = signal<Todo[]>(initial)
  const container = ul(
    list(
      source,
      t => String(t.id),
      t => li(computed(() => t.value.text)),
    ),
  )
  return { source, container }
}

const liNodes = (container: HTMLElement) =>
  Array.from(container.children).filter(c => c.tagName === 'LI')

describe('keyed-список', () => {
  it('рендерит начальные элементы', () => {
    const { container } = setup([
      { id: 1, text: 'a' },
      { id: 2, text: 'b' },
    ])
    expect(liNodes(container).map(n => n.textContent)).toEqual(['a', 'b'])
  })

  it('добавление сохраняет существующие узлы', () => {
    const { source, container } = setup([{ id: 1, text: 'a' }])
    const first = liNodes(container)[0]
    source.value = [
      { id: 1, text: 'a' },
      { id: 2, text: 'b' },
    ]
    const nodes = liNodes(container)
    expect(nodes.map(n => n.textContent)).toEqual(['a', 'b'])
    expect(nodes[0]).toBe(first)
  })

  it('удаление убирает узел, остальные на месте', () => {
    const { source, container } = setup([
      { id: 1, text: 'a' },
      { id: 2, text: 'b' },
    ])
    const second = liNodes(container)[1]
    source.value = [{ id: 2, text: 'b' }]
    const nodes = liNodes(container)
    expect(nodes.length).toBe(1)
    expect(nodes[0]).toBe(second)
  })

  it('перестановка переиспользует узлы и сохраняет порядок', () => {
    const { source, container } = setup([
      { id: 1, text: 'a' },
      { id: 2, text: 'b' },
      { id: 3, text: 'c' },
    ])
    const byId = new Map(liNodes(container).map(n => [n.textContent, n]))
    source.value = [
      { id: 3, text: 'c' },
      { id: 1, text: 'a' },
      { id: 2, text: 'b' },
    ]
    expect(liNodes(container).map(n => n.textContent)).toEqual(['c', 'a', 'b'])
    expect(liNodes(container)[0]).toBe(byId.get('c'))
    expect(liNodes(container)[2]).toBe(byId.get('b'))
  })

  it('rename патчит item-signal и обновляет DOM', () => {
    const { source, container } = setup([{ id: 1, text: 'было' }])
    const first = liNodes(container)[0]
    source.value = [{ id: 1, text: 'стало' }]
    expect(first.textContent).toBe('стало')
    expect(liNodes(container)[0]).toBe(first)
  })

  it('unmount контейнера диспозит effect списка', () => {
    const { source, container } = setup([{ id: 1, text: 'a' }])
    unmount(container)
    source.value = [
      { id: 1, text: 'a' },
      { id: 2, text: 'b' },
    ]
    expect(liNodes(container).length).toBe(1)
  })
})

describe('список рядом со статичными детьми', () => {
  it('якорь не мешает остальным детям', () => {
    const source = signal(['x'])
    const node = div('до ', ul(list(source, s => s, s => li(s))), ' после')
    source.value = ['x', 'y']
    expect(node.textContent).toBe('до xy после')
  })
})
