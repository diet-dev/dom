# 03: Controlled inputs

Status: done
Blocked by: 02

React-поведение `value`/`checked` в ядре. Проверяется через `h()`, без JSX.

## Acceptance

- [x] `defaultValue` → свойство `defaultValue`, `defaultChecked` → `defaultChecked` (uncontrolled-старт)
- [x] `value`/`checked` plain + `onChange` → controlled: после соответствующего события (`input`/`change`) значение возвращается к prop (сохранённое в `WeakMap`)
- [x] `value`/`checked` plain без `onChange` → read-only: значение сбрасывается на событии + `console.warn` (без зависимости от `process.env`)
- [x] `value`/`checked` = `Signal` → прежний bind через `effect`; controlled-логика не вмешивается
- [x] Гейт `npm run typecheck && npm test` зелёный
