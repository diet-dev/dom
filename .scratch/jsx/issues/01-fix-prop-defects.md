# 01: Починка дефектов пропсов в ядре

Status: done (feat/jsx: 6b782f5, 4e0b625)
Blocked by: None (can start immediately)

Префакторинг перед React-слоем: устранить дефекты пропсов, найденные на ревью, в текущем слое применения пропсов.

## Acceptance

- [x] `readOnly: true` выставляет DOM-свойство `readOnly` (и атрибут), а не мёртвое `readonly`
- [x] `select({ value: "b" }, option("a"), option({ value: "b" }, "b"))` даёт `.value === "b"` (значение применяется после монтирования детей)
- [x] Signal-проп, изменившийся на `null`, очищает DOM-состояние (не оставляет прежнее значение)
- [x] Гейт `npm run typecheck && npm test` зелёный
