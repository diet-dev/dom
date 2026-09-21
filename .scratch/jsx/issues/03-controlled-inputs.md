# 03: Controlled inputs

Status: ready-for-agent
Blocked by: 02

React-поведение `value`/`checked` в ядре. Проверяется через `h()`, без JSX.

## Acceptance

- [ ] `defaultValue` → свойство `defaultValue`, `defaultChecked` → `defaultChecked` (uncontrolled-старт)
- [ ] `value`/`checked` plain + `onChange` → controlled: после соответствующего события (`input`/`change`) значение возвращается к prop (сохранённое в `WeakMap`)
- [ ] `value`/`checked` plain без `onChange` → read-only: значение сбрасывается на событии + `console.warn` (без зависимости от `process.env`)
- [ ] `value`/`checked` = `Signal` → прежний bind через `effect`; controlled-логика не вмешивается
- [ ] Гейт `npm run typecheck && npm test` зелёный
