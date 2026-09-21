# 01: Подготовка пакета @dietdev/dom к публикации

Status: ready-for-agent
Blocked by: —

Реструктуризация (src — библиотека, test — тесты, demo — приложение), package.json по образцу ../Binary, tsconfig.build.json с rewriteRelativeImportExtensions, README, prettier.

## Acceptance

- `npm run prepublishOnly` (typecheck → test → build) проходит
- `npm pack --dry-run` показывает @dietdev/dom 0.1.0, только dist/ + package.json + README
- демо работает из demo/ (`npm run dev`)

## Comments

Резолюция: всё выполнено. pack --dry-run: 14 файлов, 7.0 КБ tgz / 21 КБ unpacked. typecheck (strict, NodeNext) чистый, 33/33 теста, демо проверено в браузере. Публикация — руками через npm publish.
