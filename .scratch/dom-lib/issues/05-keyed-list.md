# 05: Keyed-реконсилятор списков

Status: ready-for-agent
Blocked by: 04

`src/dom/list.ts`: `list(source, keyOf, render) => ListView`; ListView монтирует comment-якорь и keyed-diff:

- существующие ключи: узел переиспользуется, item-signal патчится
- новые: создаются через `render(itemSignal)`
- удалённые: `unmount(node)` + remove
- порядок: обратный проход с курсором от якоря, пропуск узлов уже на месте
- ключи уникальны (требование к keyOf, Map по ключам)

## Acceptance

- добавление/удаление/перестановка переиспользуют узлы (проверка по identity элемента)
- rename элемента обновляет его DOM через item-signal
- unmount контейнера диспозит effect списка

## Comments

Резолюция: ListView — comment-якорь, diff по Map ключей, переиспользование с патчем item-signal, удалённые через unmount+remove, порядок — обратный проход с курсором и пропуском узлов на месте. Тесты покрывают добавление/удаление/перестановку/rename/unmount по identity узлов. render должен возвращать один Node; контент элемента делается реактивным через computed от item-signal.
