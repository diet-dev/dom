# 06: Демо на библиотеке

Status: ready-for-agent
Blocked by: 04, 05

Переписать `src/main.ts`: счётчик (signal + computed), todo-лист на `list()` (добавление/удаление, keyed), input с двусторонним связыванием (value: signal + oninput). Минимальные стили в `src/style.css`.

## Acceptance

- `npm run dev`: демо работает, обновления без ручных DOM-манипуляций
- `npm run build` проходит (tsc + vite)

## Comments

Резолюция: main.ts переписан (счётчик, keyed-todo, двусторонний input), style.css минимален. Проверено в браузере: счётчик, добавление по Enter, удаление, переиспользование узлов; консоль чистая. npm run build (tsc + vite) проходит — бандл 3.5 КБ gzip.
