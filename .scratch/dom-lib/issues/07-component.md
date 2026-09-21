# 07: Хелпер component()

Status: ready-for-agent
Blocked by: 02

`src/component.ts`: `component(render)` — обёртка над функцией-рендером, дающая компонентам перегрузку фабрик тегов: первая форма вызова — пропсы, вторая — дети (при вызове детьми props — пустой объект). Дизамбигуация props/children вынесена в общий `splitArgs` (h.ts), tags.ts использует её же.

## Acceptance

- `autocomplete({ items, onpick })` — props-first
- `comp(span('текст'))` — children-first, props = {}
- `render(null)` → props = {}
- компонент-автокомплит работает целиком: фильтрация, выбор, unmount

## Comments

Резолюция: 38/38 тестов (4 на перегрузки + сквозной автокомплит), typecheck чистый. Компоненты-функции работали и без обёртки — component() только унифицирует эргономику с тегами.
