# 03: Обработка пропсов

Status: ready-for-agent
Blocked by: 02

В `applyProps` (h.ts): `on*` → addEventListener; `class` (строка/массив с falsy); `style` (строка/объект); `dataset`; `ref` callback; `value` и булевы — свойствами; остальное — setAttribute(String).

## Acceptance

- событие навешивается и срабатывает при dispatchEvent
- `class: ['a', cond && 'b']` собирает только truthy
- `disabled: false` ставит свойство, не атрибут
- `ref` вызывается с созданным элементом

## Comments

Резолюция: applyProp с ветками class (строка/массив/falsy)/style/dataset/on*/value/булевы/ref, остальное — setAttribute. Пропсы типизированы: `{ [K in \`on${string}\`]?: EventListener }`. Тесты — props.test.ts. Уточнение: булево свойство при true отражается в атрибут (спецификация HTML), тест проверяет hasAttribute.
