# 06: Миграция демо и тестов на JSX

Status: ready-for-agent
Blocked by: 03, 05

## Acceptance

- [ ] Демо автокомплита и список задач переведены на `.tsx`, запускаются через `npm run dev`
- [ ] Поведение автокомплита из issue 08 сохранено: ввод фильтрует, Enter добавляет, клик подставляет, дедуп, реактивные items
- [ ] `test/component` переведён на `.tsx`; добавлены `test/jsx` и `test/react-compat`
- [ ] Сквозной тест автокомплита: фильтр → pick → unmount
- [ ] Гейт `npm run typecheck && npm test && npm run build` зелёный
