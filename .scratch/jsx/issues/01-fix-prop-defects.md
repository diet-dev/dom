# 01: Починка дефектов пропсов в ядре

Status: ready-for-agent
Blocked by: None (can start immediately)

Префакторинг перед React-слоем: устранить дефекты пропсов, найденные на ревью, в текущем слое применения пропсов.

## Acceptance

- [ ] `readOnly: true` выставляет DOM-свойство `readOnly` (и атрибут), а не мёртвое `readonly`
- [ ] `select({ value: "b" }, option("a"), option({ value: "b" }, "b"))` даёт `.value === "b"` (значение применяется после монтирования детей)
- [ ] Signal-проп, изменившийся на `null`, очищает DOM-состояние (не оставляет прежнее значение)
- [ ] Гейт `npm run typecheck && npm test` зелёный
