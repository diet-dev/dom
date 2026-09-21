# Dom

Построение DOM из TypeScript: типизированные фабрики тегов, точечная реактивность на сигналах, keyed-списки с переиспользованием узлов.

## Установка

```bash
npm install @dietdev/dom
```

```ts
import { div, button, signal, computed } from "@dietdev/dom";
```

Пакет публикуется собранным: `dist/` содержит ES-модули и декларации типов. Для потребителя нужен Node.js 18+ и, если проект на TypeScript, компилятор 5.7 или новее — декларации сохраняют расширения `.ts` в относительных импортах, а разрешать их научились начиная с этой версии. Реактивность построена на [`@preact/signals-core`](https://www.npmjs.com/package/@preact/signals-core) (~1 КБ), он приходит как зависимость.

## Зачем

Виртуальный DOM решает задачу «перерисуй всё по описанию дерева». Эта библиотека исходит из другого: DOM и так умеет обновляться точечно, нужно лишь связать узлы с состоянием.

- **Без виртуального DOM.** Элементы создаются нативным `createElement`, дерево не перестраивается. Нет diff-алгоритма по всему дереву — обновляется ровно тот текст/атрибут, который изменился.
- **Реактивность там, где объявлена.** `signal` можно передать вместо текста, ребёнка или значения пропса — библиотека сама подпишется и будет патчить узел. Вне сигналов никакого реактивного слоя нет.
- **Keyed-списки с переиспользованием.** При изменении массива узлы с сохранившимися ключами не пересоздаются: им патчится item-signal, эффекты внутри живут.
- **Cleanup — явно.** `unmount(node)` рекурсивно диспозит все эффекты поддерева. Никакой магии с MutationObserver и ложных срабатываний при перемещении узлов.
- **Маленькая.** Библиотека — около 3.5 КБ gzip вместе с ядром сигналов.

## Пример

```ts
import { signal, computed } from "@dietdev/dom";
import { div, h1, ul, li, input, button, list } from "@dietdev/dom";

const todos = signal([{ id: 1, text: "вынести мусор", done: false }]);
const draft = signal("");

const app = div(
  { class: "app" },
  h1("Задачи"),
  ul(
    list(
      todos,
      (t) => String(t.id),
      (t) =>
        li(
          { class: computed(() => (t.value.done ? "done" : "")) },
          computed(() => t.value.text),
        ),
    ),
  ),
  input({
    placeholder: "Новая задача",
    value: draft,
    oninput: (e) => (draft.value = (e.target as HTMLInputElement).value),
    onkeydown: (e) => {
      if (e.key === "Enter") add();
    },
  }),
  button({ onclick: add }, "Добавить"),
);

function add() {
  const text = draft.value.trim();
  if (!text) return;
  todos.value = [...todos.value, { id: Date.now(), text, done: false }];
  draft.value = "";
}

document.getElementById("app")!.append(app);
```

## Создание элементов

```ts
h("div", props?, ...children)   // ядро: тег строкой
div(props?, ...children)        // фабрика на тег
el("progress", { value: 50 })   // escape-hatch для любого тега
```

Фабрики есть на ~41 тег ядра: контейнеры (`div`, `section`, `article`, `header`, `footer`, `main`, `nav`, `aside`, `span`), текст (`h1`–`h6`, `p`, `a`, `strong`, `em`, `code`, `pre`, `small`, `blockquote`, `br`), списки (`ul`, `ol`, `li`), формы (`form`, `input`, `button`, `label`, `select`, `option`, `textarea`), таблицы (`table`, `thead`, `tbody`, `tr`, `th`, `td`), `img`. Всё остальное — через `el("тег")`.

Первая форма вызова фабрики — пропсы, вторая — дети: `div({ class: "x" }, …)` и `div("текст")` равнозначны.

### Пропсы

- `on*` (функция) → `addEventListener`
- `class` → строка, массив с пропусками falsy или signal: `["a", isActive && "b"]`
- `style` → строка или объект `CSSStyleDeclaration`
- `dataset` → `el.dataset`
- `ref` → callback `(el) => void`
- `value`, `disabled`, `checked` и другие булевы → свойствами элемента, не атрибутами
- остальное → `setAttribute`

### Дети

```ts
type Child =
  | string
  | number
  | Node
  | Signal // реактивный ребёнок
  | ListView<any> // keyed-список
  | Child[]
  | null
  | undefined
  | false;
```

Signal-ребёнок обновляет содержимое узла при изменении: строка/число — `textContent`, `Node` — заменой, `null`/`false` — пусто.

## Реактивность

Реэкспортируется API `@preact/signals-core`: `signal`, `computed`, `effect`, `batch`, `untracked`. Сигнал допустим в детях и в любом пропсе:

```ts
const busy = signal(false);
button({ disabled: busy, onclick: save }, "Сохранить");
```

### Списки

```ts
list(
  source, // Signal<T[]>
  (item) => String(item.id), // ключ (уникальный, стабильный)
  (item) => li(item.value.text), // рендер одного элемента: Signal<T> -> Node
);
```

При изменении массива: элементы с сохранившимися ключами переиспользуются (их item-signal патчится), новые создаются, отсутствующие — `unmount` и удаление. Чтобы содержимое элемента реагировало на изменения, читайте item через `computed`:

```ts
(t) => li(computed(() => t.value.text));
```

### Очистка

```ts
unmount(app);
```

Диспозит все эффекты поддерева и удаляет корневой узел из родителя. Вызывайте при уходе со «страницы» или при замене поддерева, иначе подписи сигналов переживут DOM.

## Компоненты

Компонент — это функция, возвращающая узел. Поскольку `Child` принимает любой `Node`, такие функции используются на одном уровне с тегами без поддержки со стороны библиотеки.

Хелпер `component()` добавляет компонентам перегрузку фабрик — первая форма вызова пропсы, вторая дети, как у `div()`:

```ts
import { component, div, input, signal } from "@dietdev/dom";

interface AutocompleteProps {
  items: Signal<string[]>;
  onpick: (item: string) => void;
}

const autocomplete = component((props: AutocompleteProps) => {
  const query = signal(""); // приватное состояние — замыкание
  return div(
    { class: "autocomplete" },
    input({
      value: query,
      oninput: (e) => {
        query.value = (e.target as HTMLInputElement).value;
      },
    }),
    ul(/* отфильтрованный список */),
  );
});

// использование — как у любого тега:
div({ class: "form" }, autocomplete({ items: cities, onpick: pick }));
```

Реактивные пропсы — по соглашению: передавайте `Signal` там, где значение должно обновляться, и читайте его через `computed` внутри компонента. При `unmount` эффекты поддерева, созданные внутри компонентов, диспозятся наравне с остальными.

## Ограничения

- Нет SVG (`createElementNS` не поддерживается).
- Пропсы типизируются общим `Props`, а не по-тегам: опечатка в `plaeholder` не поймается компилятором.
- `render` в `list` должен возвращать один узел.

## Развитие

Список задач — в `.scratch/dom-lib/`. Демо: `npm run dev` (каталог `demo/`).
