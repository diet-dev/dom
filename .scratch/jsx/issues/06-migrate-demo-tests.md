# 06: Миграция демо и тестов на JSX

Status: done
Blocked by: 03, 05

## Acceptance

- [x] Демо автокомплита и список задач переведены на `.tsx`, запускаются через `npm run dev`
- [x] Поведение автокомплита из issue 08 сохранено: ввод фильтрует, Enter добавляет, клик подставляет, дедуп, реактивные items
- [x] `test/component` переведён на `.tsx`; добавлены `test/jsx` и `test/react-compat`
- [x] Сквозной тест автокомплита: фильтр → pick → unmount
- [x] Гейт `npm run typecheck && npm test && npm run build` зелёный
