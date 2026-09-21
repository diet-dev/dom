# 02: Ядро h() и фабрики тегов

Status: ready-for-agent
Blocked by: 01

`src/dom/h.ts`: типы `Child`/`Props`, функция `h(tag, props?, ...children)`, `appendChildren` (строки, числа, Node, массивы любой вложенности, null/undefined/false пропускаются).

`src/dom/tags.ts`: фабрики на ~41 тег ядра (перегрузка: `(props?, ...children)` или `(...children)`) + `el` = `h` как escape-hatch.

## Acceptance

- `div()` возвращает HTMLDivElement
- дети: строки, числа, узлы, вложенные массивы
- фабрики работают во всех формах вызова, включая `div('текст')`

## Comments

Резолюция: h.ts (h, applyProps, appendChildren, bindChildSignal) + tags.ts (41 фабрика + el = h). Тесты — h.test.ts. Нюанс: Child содержит ListView<any> из-за вариантности дженерика.
