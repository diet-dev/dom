# Спека: публикация @dietdev/dom в NPM

Подготовка библиотеки Dom к публикации по образцу `../Binary` (`@dietdev/binary`).

## Решения

- Имя пакета `@dietdev/dom`, версия `0.1.0`, author/publishConfig/engines как в Binary
- Публикуется собранный `dist/` (ESM + декларации, `rewriteRelativeImportExtensions` → потребителю нужен TS 5.7+)
- Скрипты: `typecheck`, `build` (tsc -p tsconfig.build.json), `prepublishOnly` (typecheck → test → build); демо-сборка вынесена в `build:demo`
- Реактивность — рантайм-зависимость `@preact/signals-core`; остальное в devDependencies
- Тесты остаются на vitest + jsdom (в отличие от Binary с node:test — нужен DOM)

## Структура

```
src/     — только библиотека (h, tags, bind, list, signals, index)
test/    — vitest-тесты
demo/    — Vite-приложение (vite.config: root: 'demo', outDir: dist-demo)
```

## Вне скоупа

- Сама публикация (`npm publish`) — руками, после `npm login`
- CI, changesets
