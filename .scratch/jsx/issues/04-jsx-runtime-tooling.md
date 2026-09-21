# 04: Автоматический JSX-рантайм и тулинг

Status: ready-for-agent
Blocked by: 02

Минимальный сквозной путь: `.tsx` компилируется автоматическим рантаймом и рендерится в DOM.

## Acceptance

- [ ] Настроены `tsconfig` (`jsx`, `jsxImportSource`, `paths`), alias в Vite и Vitest
- [ ] В `exports` пакета добавлены подпути `./jsx-runtime` и `./jsx-dev-runtime`; `npm run build` отдаёт `dist/jsx-runtime.js` и `.d.ts`
- [ ] Рантайм экспортирует `jsx`, `jsxs`, `jsxDEV`, `Fragment` и namespace `JSX`; `key` отрезается, `props.children` распаковывается, строковый тег → `h`
- [ ] `.tsx`-тест: `<div className="x" onClick={...}>…</div>` даёт корректный DOM
- [ ] Namespace `JSX` работает без глобальных деклараций; интринсик-теги пермиссивные (`[tag: string]`)
- [ ] Импорт рантайма SSR-безопасен (не трогает `document`)
- [ ] Гейт `npm run typecheck && npm test && npm run build` зелёный
