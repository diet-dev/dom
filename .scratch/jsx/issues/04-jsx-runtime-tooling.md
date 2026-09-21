# 04: Автоматический JSX-рантайм и тулинг

Status: done
Blocked by: 02

Минимальный сквозной путь: `.tsx` компилируется автоматическим рантаймом и рендерится в DOM.

## Acceptance

- [x] Настроены `tsconfig` (`jsx`, `jsxImportSource`, `paths`), alias в Vite и Vitest
- [x] В `exports` пакета добавлены подпути `./jsx-runtime` и `./jsx-dev-runtime`; `npm run build` отдаёт `dist/jsx-runtime.js` и `.d.ts`
- [x] Рантайм экспортирует `jsx`, `jsxs`, `jsxDEV`, `Fragment` и namespace `JSX`; `key` отрезается, `props.children` распаковывается, строковый тег → `h`
- [x] `.tsx`-тест: `<div className="x" onClick={...}>…</div>` даёт корректный DOM
- [x] Namespace `JSX` работает без глобальных деклараций; интринсик-теги пермиссивные (`[tag: string]`)
- [x] Импорт рантайма SSR-безопасен (не трогает `document`)
- [x] Гейт `npm run typecheck && npm test && npm run build` зелёный
