# Спека: библиотека Dom

Минимальная типизированная библиотека для построения DOM в TypeScript.

## Решения

- **API**: явные фабрики (`div()`, `input()`, ... ~40 тегов ядра) + `h()` внизу + `el('тег')` escape-hatch для экзотики
- **Реактивность**: `@preact/signals-core` (`signal`, `computed`, `effect`, `batch`, `untracked`); `Signal` допустим в детях и пропсах
- **Списки**: keyed-реконсиляция (`list()`), переиспользование узлов по ключу
- **Cleanup**: ручной `unmount(node)` — рекурсивный dispose эффектов поддерева (WeakMap disposers)
- **Теги**: ядро ~41 тег; всё остальное — через `el()`. SVG (`createElementNS`) — вне v1

## Обработка пропсов

- `on*` (функция) → `addEventListener` (имя события в lower-case)
- `class` → `className`, поддерживает `string | (string | falsy)[] | Signal`
- `style` → `string | Partial<CSSStyleDeclaration>`
- `dataset` → `el.dataset`
- `ref` → callback `(el) => void`
- `value` → свойство (для input/textarea/select)
- булевы (`disabled`, `checked`, `readonly`, `required`, `selected`, `multiple`, `autofocus`, `hidden`) → свойство
- остальное → `setAttribute(String(v))`
- `Signal` в любом пропсе → bind через `effect`, обновление на изменение

## Дети

`Child = string | number | Node | Signal | ListView | Child[] | null | undefined | false`

- Signal-ребёнок: текст — textContent; Node — `replaceChild`; `null` → пустой маркер
- ListView — монтируется в контейнер, keyed-diff по `keyOf`

## Файлы

- `src/dom/h.ts` — ядро: типы, `h()`, appendChildren, applyProps
- `src/dom/tags.ts` — фабрики ядра + `el`
- `src/dom/bind.ts` — `bind()`, `unmount()`, WeakMap disposers
- `src/dom/list.ts` — `ListView`, `list()`
- `src/dom/signals.ts` — реэкспорт `@preact/signals-core`
- `src/dom/index.ts` — публичный API

## Вне v1 (бэклог)

- SVG через `createElementNS`
- Типизация пропсов по-тегам (input принимает только свои атрибуты)
- Авто-cleanup через MutationObserver
