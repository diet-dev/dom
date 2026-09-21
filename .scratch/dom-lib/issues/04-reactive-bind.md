# 04: Реактивные пропсы, дети и unmount

Status: ready-for-agent
Blocked by: 02, 03

`src/dom/bind.ts`: `bind(node, apply)` — effect из @preact/signals-core + disposers в WeakMap; `unmount(node)` — рекурсивный dispose поддерева и удаление из родителя.

Интеграция в h.ts: `Signal` в пропсе → bind с повторным применением пропса; `Signal`-ребёнок → привязанный узел (текст — textContent, Node — replaceChild, null — пустой маркер).

`src/dom/signals.ts`: реэкспорт @preact/signals-core.

## Acceptance

- изменение signal обновляет текст/класс/value без ручного кода
- после `unmount(app)` изменение signal не меняет DOM
- `unmount` удаляет узел из родителя

## Comments

Резолюция: bind.ts — bind (effect + WeakMap) и unmount; важный фикс: рекурсивный обход диспозит поддерево, но removeChild — только для корневого узла (первая версия вычищала детей из корня). Signal в пропсах — bind + повторный applyProp; Signal-ребёнок — маркер + replaceWith (текст/Node/null). signals.ts реэкспортирует @preact/signals-core. Тесты — bind.test.ts.
