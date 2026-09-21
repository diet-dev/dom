import { describe, expect, it } from 'vitest'
import { div, input, button } from './tags.ts'

describe('пропсы', () => {
  it('class: строка', () => {
    expect(div({ class: 'a b' }).className).toBe('a b')
  })

  it('class: массив собирает только truthy', () => {
    const flag = false
    expect(div({ class: ['a', flag && 'b', null, undefined, 'c'] }).className).toBe('a c')
  })

  it('style: строка', () => {
    expect(div({ style: 'color: red' }).getAttribute('style')).toBe('color: red')
  })

  it('style: объект', () => {
    const node = div({ style: { fontSize: '14px', color: 'red' } })
    expect(node.style.fontSize).toBe('14px')
    expect(node.style.color).toBe('red')
  })

  it('dataset', () => {
    expect(div({ dataset: { userId: '7' } }).dataset.userId).toBe('7')
    expect(div({ dataset: { userId: '7' } }).getAttribute('data-user-id')).toBe('7')
  })

  it('on* навешивает обработчик события', () => {
    let clicked = 0
    const node = button({ onclick: () => clicked++ })
    node.click()
    expect(clicked).toBe(1)
  })

  it('value — свойство, не атрибут', () => {
    const node = input({ value: 'текст' })
    expect((node as HTMLInputElement).value).toBe('текст')
    expect(node.getAttribute('value')).toBeNull()
  })

  it('булевы пропсы — свойства', () => {
    const node = button({ disabled: false })
    expect((node as HTMLButtonElement).disabled).toBe(false)
    expect(node.getAttribute('disabled')).toBeNull()
    const off = button({ disabled: true })
    expect((off as HTMLButtonElement).disabled).toBe(true)
    expect(off.hasAttribute('disabled')).toBe(true)
  })

  it('прочие — атрибуты', () => {
    const node = input({ type: 'text', placeholder: 'имя', id: 'name' })
    expect(node.getAttribute('type')).toBe('text')
    expect(node.getAttribute('placeholder')).toBe('имя')
    expect(node.getAttribute('id')).toBe('name')
  })

  it('ref вызывается с элементом', () => {
    let captured: HTMLElement | null = null
    const node = div({ ref: el => (captured = el) })
    expect(captured).toBe(node)
  })
})
