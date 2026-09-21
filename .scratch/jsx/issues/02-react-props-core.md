# 02: React-семантика имён и событий в пропсах

Status: ready-for-agent
Blocked by: 01

Единый React-контракт пропсов для всех путей (`h`, `tags`, `component`) — до появления JSX. Ломающее изменение относительно DOM-контракта 0.1.0.

## Acceptance

- [ ] `className` → `class`, `htmlFor` → `for`, `key` игнорируется (не становится атрибутом)
- [ ] `onDoubleClick` → событие `dblclick`
- [ ] `onChange`: текстовый/числовой `input` и `textarea` → событие `input`; `select` и `input[type=checkbox|radio|file]` → событие `change`
- [ ] Таблица «React-имя → DOM-свойство» заменяет lowercase-набор: `readOnly` → `readOnly`, `autoFocus` → `autofocus`, остальные булевы (`disabled`/`checked`/`required`/`selected`/`multiple`/`hidden`) — как прежде
- [ ] `ref` принимает callback `(el) => void` и объект `{ current }`
- [ ] Прочие React-события (`onMouseEnter`, `onKeyDown`, `onSubmit`, `onFocus`, `onBlur`) лоуэрятся в корректный DOM-тип
- [ ] Гейт `npm run typecheck && npm test` зелёный (существующие тесты адаптированы к новому контракту)
