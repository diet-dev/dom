# Dom

Построение DOM из TypeScript: типизированные фабрики тегов, JSX без виртуального DOM, точечная реактивность на сигналах, keyed-списки с переиспользованием узлов.

## Установка

```bash
npm install @dietdev/dom
```

```ts
import { div, button, signal, computed } from "@dietdev/dom";
```

Пакет публикуется собранным: `dist/` содержит ES-модули и декларации типов. Для потребителя нужен Node.js 18+ и, если проект на TypeScript, компилятор 5.7 или новее — декларации сохраняют расширения `.ts` в относительных импортах, а разрешать их научились начиная с этой версии. Реактивность построена на [`@preact/signals-core`](https://www.npmjs.com/package/@preact/signals-core) (~1 КБ), он приходит как зависимость.

## Настройка JSX

Библиотека поставляет собственный JSX-рантайм (автоматический режим, без React). Пошагово:

1. В `tsconfig.json` включите автоматический режим и укажите источник рантайма:

   ```json
   {
     "compilerOptions": {
       "jsx": "react-jsx",
       "jsxImportSource": "@dietdev/dom"
     }
   }
   ```

2. Переименуйте файлы с разметкой в `.tsx` — компилятор будет импортировать `jsx`/`jsxs` из подпути `@dietdev/dom/jsx-runtime` сам, без ручных импортов.

3. Для dev-сборок можно включить `"jsx": "react-jsxdev"` — подключится `@dietdev/dom/jsx-dev-runtime`.

4. `Fragment` импортируется явно, из корня пакета: `import { Fragment } from "@dietdev/dom"`.

Сборщикам ничего донастраивать не нужно: рантайм доступен через `exports`-подпути пакета (для Vite работает из коробки; для Vitest добавьте зеркальные `resolve.alias`, если он не читает `paths` вашего tsconfig).

```tsx
import { signal } from "@dietdev/dom";

const count = signal(0);
const app = <button onClick={() => count.value++}>Кликов: {count}</button>;
```

## Зачем

Виртуальный DOM решает задачу «перерисуй всё по описанию дерева». Эта библиотека исходит из другого: DOM и так умеет обновляться точечно, нужно лишь связать узлы с состоянием.

- **Без виртуального DOM.** Элементы создаются нативным `createElement`, дерево не перестраивается. Нет diff-алгоритма по всему дереву — обновляется ровно тот текст/атрибут, который изменился.
- **Реактивность там, где объявлена.** `signal` можно передать вместо текста, ребёнка или значения пропса — библиотека сама подпишется и будет патчить узел. Вне сигналов никакого реактивного слоя нет.
- **Keyed-списки с переиспользованием.** При изменении массива узлы с сохранившимися ключами не пересоздаются: им патчится item-signal, эффекты внутри живут.
- **Cleanup — явно.** `unmount(node)` рекурсивно диспозит все эффекты поддерева. Никакой магии с MutationObserver и ложных срабатываний при перемещении узлов.
- **Маленькая.** Библиотека — около 3.7 КБ gzip вместе с ядром сигналов.

## Сигналы

Реактивность — это [`@preact/signals-core`](https://www.npmjs.com/package/@preact/signals-core): библиотека реэкспортирует его API целиком и не добавляет своего слоя поверх.

- **`signal(value)`** — ячейка состояния с методом `.value`. Чтение `.value` внутри эффекта подписывает его на сигнал, запись `.value = ...` уведомляет только тех подписчиков, которые читали именно его. Основа всего реактивного.
- **`computed(fn)`** — сигнал «только для чтения», значение которого выводится из других сигналов. Пересчитывается лениво и кэшируется: пока его зависимости не изменились, повторные чтения бесплатны. Используйте для производных данных — форматированных строк, классов, видимости блоков.

Автоматическое отслеживание зависимостей работает так: во время выполнения `fn` (в `computed` или `effect`) каждое чтение `.value` запоминается как зависимость; после записи в сигнал зависимости перечитываются заново — подписки следуют за фактическими путями выполнения кода, вручную их декларировать не нужно. `batch(fn)` группирует несколько записей в одно уведомление, `untracked(fn)` читает сигнал без подписки.

Библиотека привязывает сигналы к DOM: signal в детях или пропсах создаёт эффект, который патчит ровно этот текст/атрибут/узел (см. [Реактивность](#реактивность)).

## Пример

```tsx
import { signal, computed, list } from "@dietdev/dom";

const todos = signal([{ id: 1, text: "вынести мусор", done: false }]);
const draft = signal("");

function add() {
  const text = draft.value.trim();
  if (!text) return;
  todos.value = [...todos.value, { id: Date.now(), text, done: false }];
  draft.value = "";
}

const app = (
  <div className="app">
    <h1>Задачи</h1>
    <ul>
      {list(
        todos,
        (t) => String(t.id),
        (t) => (
          <li className={computed(() => (t.value.done ? "done" : ""))}>{computed(() => t.value.text)}</li>
        ),
      )}
    </ul>
    <input
      placeholder="Новая задача"
      value={draft}
      onChange={(e) => (draft.value = (e.target as HTMLInputElement).value)}
      onKeyDown={(e) => {
        if ((e as KeyboardEvent).key === "Enter") add();
      }}
    />
    <button onClick={add}>Добавить</button>
  </div>
);

document.getElementById("app")!.append(app);
```

## Создание элементов

```ts
h("div", props?, ...children)   // ядро: тег строкой
div(props?, ...children)        // фабрика на тег
el("progress", { value: 50 })   // escape-hatch для любого тега
```

JSX-выражение `<div {...}>…</div>` — это тот же вызов `h("div", props, ...children)`: фабрики, `h()` и JSX проходят через один слой применения пропсов и могут свободно смешиваться.

Фабрики есть на ~41 тег ядра: контейнеры (`div`, `section`, `article`, `header`, `footer`, `main`, `nav`, `aside`, `span`), текст (`h1`–`h6`, `p`, `a`, `strong`, `em`, `code`, `pre`, `small`, `blockquote`, `br`), списки (`ul`, `ol`, `li`), формы (`form`, `input`, `button`, `label`, `select`, `option`, `textarea`), таблицы (`table`, `thead`, `tbody`, `tr`, `th`, `td`), `img`. Всё остальное — через `el("тег")` или любой строковый тег в JSX.

Первая форма вызова фабрики — пропсы, вторая — дети: `div({ class: "x" }, …)` и `div("текст")` равнозначны.

### Пропсы

Имена — React-совместимые; DOM-алиасы (`class` вместо `className`, `oninput` вместо `onInput`) тоже принимаются.

- `on*` (функция, React-имя) → `addEventListener`: `onClick` → `click`, `onKeyDown` → `keydown`, исключение — `onDoubleClick` → `dblclick`
- `onChange` — элемент-зависим: текстовый `input` и `textarea` → событие `input`, `select` и `input[type=checkbox|radio|file]` → `change`. Отступление от React: `onFocus`/`onBlur` остаются DOM-событиями и не всплывают
- `className` (алиас `class`) → строка, массив с пропусками falsy или signal: `["a", isActive && "b"]`
- `htmlFor` (алиас `for`) → связывание `label` с полем
- `style` → строка или объект `CSSStyleDeclaration`
- `dataset` → `el.dataset`
- `ref` → callback `(el) => void` или объект `{ current }`
- `readOnly`, `autoFocus`, `disabled`, `checked`, `required`, `selected`, `multiple`, `hidden` → свойствами элемента (IDL-регистр), не атрибутами
- `key` → игнорируется (не доходит до DOM); переиспользование узлов — только через `list()`
- остальное → `setAttribute`

### Формы и контролируемость

`value` и `checked` имеют три режима — идиоматичный и два legacy-совместимых:

- **`Signal` (рекомендуется).** `value={draft}` связывает поле с сигналом: поле показывает `draft.value` и обновляется при каждом изменении (signal → DOM). Ввод пользователя попадает в сигнал обработчиком `onChange={(e) => (draft.value = e.target.value)}` — значением владеет сигнал, «заморозки» как у React не происходит.
- **plain-значение + `onChange`** — контролируемость как в React: пользовательский ввод сбрасывается к пропсу, пока не обновлён внешний источник. Обновляйте состояние в `onChange`, иначе поле «заморожено».
- **plain-значение без `onChange`** — read-only: ввод сбрасывается, один раз выдаётся `console.warn`.

Uncontrolled-старт — через `defaultValue`/`defaultChecked`: поле инициализируется значением и дальше живёт своей жизнью.

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

```tsx
const busy = signal(false);
<button disabled={busy} onClick={save}>
  Сохранить
</button>;
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

Компонент — это функция от пропсов, возвращающая узел. В JSX используется как тег: `<Comp a={1}>child</Comp>` превращается в вызов `Comp({ a: 1 }, "child")`.

Хелпер `component()` добавляет компонентам перегрузку фабрик — первая форма вызова пропсы, вторая дети, как у `div()`:

```tsx
import { component, signal } from "@dietdev/dom";

const Counter = component(() => {
  const count = signal(0);
  return <button onClick={() => count.value++}>Кликов: {count}</button>;
});

// использование — как любого тега:
<Counter />;
```

Реактивные пропсы — по соглашению: состояние, которым владеет вызывающий, передавайте как `Signal`, приватное состояние компонента — замыкание внутри `component()`. Читайте signal-пропсы через `computed` там, где значение участвует в производных данных. При `unmount` эффекты поддерева, созданные внутри компонентов, диспозятся наравне с остальными.

## Ограничения

- Нет SVG (`createElementNS` не поддерживается).
- Пропсы типизируются общим `Props`, а не по-тегам: опечатка в `plaeholder` не поймается компилятором.
- `key` игнорируется — переиспользование узлов списков только через `list()`.
- `onFocus`/`onBlur` не всплывают (DOM-семантика, не React).
- `render` в `list` должен возвращать один узел.

## Развитие

Список задач — в `.scratch/jsx/`. Демо: `npm run dev` (каталог `demo/`; пример из этого README скопирован в `demo/readme.tsx` и проверяется тестом `test/readme.test.tsx`).
