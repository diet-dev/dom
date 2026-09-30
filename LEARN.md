# LEARN.md — руководство по библиотеке Dom

Пошаговое руководство для новичков: от «что это такое» до полноценного мини-приложения. Каждый пример минимальный — ровно настолько, чтобы показать приём.

---

## Содержание

1. [Что это и зачем](#1-что-это-и-зачем)
2. [Установка и запуск](#2-установка-и-запуск)
3. [Создание элементов](#3-создание-элементов)
4. [Дети](#4-дети)
5. [Пропсы](#5-пропсы)
6. [События](#6-события)
7. [Сигналы — основа реактивности](#7-сигналы--основа-реактивности)
8. [Реактивность в DOM](#8-реактивность-в-dom)
9. [Формы и контролируемые поля](#9-формы-и-контролируемые-поля)
10. [Списки: `list()`](#10-списки-list)
11. [Компоненты](#11-компоненты)
12. [JSX](#12-jsx)
13. [Очистка: `unmount()`](#13-очистка-unmount)
14. [Смешивание подходов](#14-смешивание-подходов)
15. [Подводные камни и ограничения](#15-подводные-камни-и-ограничения)
16. [Итоговый пример](#16-итоговый-пример)

---

## 1. Что это и зачем

**Dom** — небольшая библиотека для построения интерфейсов на чистом TypeScript:

- **Без виртуального DOM.** Элементы создаются нативным `document.createElement`. Дерево не перестраивается и не сравнивается с предыдущим состоянием — обновляется ровно тот текст или атрибут, который изменился.
- **Реактивность на сигналах.** Сигнал (signal) — это ячейка состояния: положили значение, прочитали, изменили. Если передать сигнал туда, где ожидается текст или пропс, библиотека сама подпишется на него и будет обновлять DOM.
- **Keyed-списки.** Список элементов привязывается к ключам: при изменении массива узлы с сохранившимися ключами не пересоздаются.
- **Маленькая.** ~3.7 КБ gzip вместе с ядром сигналов (`@preact/signals-core`).

Библиотека предлагает три равноправных синтаксиса, которые можно свободно смешивать:

| Синтаксис     | Пример                              |
| ------------- | ----------------------------------- |
| фабрики тегов | `div({ class: "x" }, "текст")`      |
| функция `h()` | `h("div", { class: "x" }, "текст")` |
| JSX           | `<div class="x">текст</div>`        |

Все три проходят через один и тот же слой применения пропсов.

---

## 2. Установка и запуск

```bash
npm install @dietdev/dom
```

Требования: Node.js 18+, TypeScript 5.7+ (если проект на TS).

Импорт — из корня пакета:

```ts
import { div, button, signal, computed } from "@dietdev/dom";
```

Минимальная страница. Библиотека создаёт настоящие DOM-узлы, поэтому их нужно просто добавить в документ:

```ts
import { button } from "@dietdev/dom";

document.getElementById("app")!.append(button({ onClick: () => alert("Привет!") }, "Нажми меня"));
```

Вот и весь «рендер» — никакого корневого вызова вроде `createRoot().render()`: создали узел, вставили в DOM.

---

## 3. Создание элементов

### Фабрики тегов

Для ~41 распространённого тега есть готовые функции-фабрики: `div`, `span`, `section`, `article`, `header`, `footer`, `main`, `nav`, `aside`, `h1`–`h6`, `p`, `a`, `strong`, `em`, `code`, `pre`, `small`, `blockquote`, `br`, `ul`, `ol`, `li`, `form`, `input`, `button`, `label`, `select`, `option`, `textarea`, `table`, `thead`, `tbody`, `tr`, `th`, `td`, `img`.

У фабрики две формы вызова — сначала пропсы, потом дети:

```ts
import { div, p, strong } from "@dietdev/dom";

const card = div({ class: "card" }, p("Обычный текст"), strong("жирный"));
```

или только дети:

```ts
const greeting = p("Привет!");
```

### `h()` и `el()` — любой тег

Тега нет среди фабрик (например, `progress`)? Используйте `h()` или её алиас `el()`:

```ts
import { h, el } from "@dietdev/dom";

const bar = h("progress", { value: 50 });
const bar2 = el("progress", { value: 50 }); // то же самое
```

---

## 4. Дети

Ребёнком (`Child`) может быть:

```ts
type Child =
  | string // текстовый узел
  | number // тоже текст
  | Node // готовый DOM-узел или результат другой фабрики
  | Signal // реактивный ребёнок (см. раздел 8)
  | ListView // keyed-список (см. раздел 10)
  | Child[] // вложенный массив — раскрывается рекурсивно
  | null
  | undefined
  | false; // пропускается
```

Примеры каждого случая:

```ts
import { div, span, signal } from "@dietdev/dom";
import { list } from "@dietdev/dom";

const s = signal("динамический текст");

const node = div(
  "строка", // текст
  42, // число -> "42"
  span("узел"), // Node
  s, // Signal
  ["в", "массиве"], // массив
  null, // пропущен
  false, // пропущен
  cond && span("условный ребёнок"), // false при cond=false -> пропущен
);
```

Приём «условный ребёнок» (`cond && node`) работает именно потому, что `false` и `null` игнорируются. Осторожно с числами: `0` и `NaN` — валидные дети и рендерятся как текст (`"0"`, `"NaN"`), поэтому `count && span("x")` при `count = 0` выведет `"0"`, а не пусто. Приводите условие к булеву явно: `count > 0 && span("x")` или `Boolean(count) && …`.

Так же и массив: как **значение** signal/computed он становится текстом (`String(["a","b"])` → `"a,b"`, массив объектов → `"[object Object],…"`), а не разворачивается. Реактивные коллекции рендерятся через `list()` (раздел 10); статический массив-ребёнок (без сигнала) разворачивается в детей.

---

## 5. Пропсы

Пропсы задаются объектом в первом аргументе. Правила трансляции в DOM:

### Обычные атрибуты

Всё, что не попадает под особые случаи ниже, устанавливается через `setAttribute`:

```ts
import { a, img } from "@dietdev/dom";

const link = a({ href: "/about", title: "О проекте" }, "О проекте");
const logo = img({ src: "/logo.png", alt: "Логотип" });
```

Значение `false` трактуется как «не задано»: `title: false` не попадает в DOM, `onClick: false` не вешает слушателя, `class: false` очищает класс. Для булевых свойств (`hidden`, `disabled`…) `false` — валидное значение «выключено».

### `class` / `className`

Принимаются оба имени. Значение — строка, массив (falsy-элементы пропускаются) или сигнал:

```ts
import { div } from "@dietdev/dom";

div({ className: "card highlighted" });
div({ className: ["card", isActive && "highlighted"] }); // isActive=false -> "card"
```

Массив удобен для условных классов без шаблонных строк.

### `htmlFor` / `for`

Связывает `label` с полем:

```ts
import { input, label } from "@dietdev/dom";

label({ htmlFor: "email" }, "Почта");
input({ id: "email", type: "email" });
```

### `style`

Строка или объект свойств (как `CSSStyleDeclaration`):

```ts
div({ style: "color: red" });
div({ style: { color: "red", marginTop: "8px" } }); // camelCase -> margin-top
```

### `dataset`

Записывается в `el.dataset` (даёт `data-*`-атрибуты):

```ts
div({ dataset: { userId: "7" } }); // <div data-user-id="7">
```

### `ref`

Способ получить ссылку на созданный узел — колбэк или объект `{ current }`:

```ts
import { input } from "@dietdev/dom";

const ref = { current: null as HTMLInputElement | null };
input({ ref }); // после создания: ref.current instanceof HTMLInputElement

input({ ref: (el) => el.focus() }); // колбэк вызывается сразу с готовым узлом
```

### Булевы свойства

`disabled`, `checked`, `readOnly`, `required`, `selected`, `multiple`, `hidden`, `autofocus` устанавливаются как свойства элемента (IDL-регистр), а не атрибуты:

```ts
input({ disabled: true, readOnly: false });
```

### `value` и `checked`

Всегда свойства, не атрибуты (см. подробнее в разделе 9):

```ts
input({ value: "текст" }).value; // "текст"
```

### `key`

Молча игнорируется и до DOM не доходит. Переиспользование узлов в списках делается только через `list()` — не через `key`.

---

## 6. События

Пропсы, начинающиеся на `on` и содержащие функцию, навешивают `addEventListener`.

### Обычные события

React-имя -> DOM-событие: `onClick` -> `click`, `onKeyDown` -> `keydown`. Исключение: `onDoubleClick` -> `dblclick`.

```ts
import { button } from "@dietdev/dom";

button({ onClick: (e) => console.log("клик по", e.target) }, "Клик");
```

DOM-алиасы тоже работают: `onclick`, `oninput`.

### `onChange` — зависит от элемента

- текстовый `input` и `textarea` -> событие `input`;
- `select`, `input[type=checkbox|radio|file]` -> событие `change`.

То есть для текстового поля `onChange` срабатывает на каждый символ — как в React.

### `onFocus` / `onBlur`

Остаются обычными DOM-событиями и **не всплывают** (в отличие от React, где они эмулируются через focusin/focusout). Не рассчитывайте поймать их на родителе.

---

## 7. Сигналы — основа реактивности

Реактивность — [`@preact/signals-core`](https://www.npmjs.com/package/@preact/signals-core), реэкспортированная целиком: `signal`, `computed`, `effect`, `batch`, `untracked`.

### `signal(value)` — ячейка состояния

```ts
import { signal } from "@dietdev/dom";

const count = signal(0);
count.value; // 0 — чтение
count.value = 5; // запись: уведомляет подписчиков
count.peek(); // прочитать БЕЗ подписки (внутри эффектов/компьютов)
```

### `computed(fn)` — производное значение

Пересчитывается лениво и кэшируется: пока зависимости не изменились, повторные чтения бесплатны.

```ts
import { signal, computed } from "@dietdev/dom";

const count = signal(2);
const doubled = computed(() => count.value * 2);
doubled.value; // 4; count не менялся — чтение из кэша
```

### Как работает автотрекинг

Во время выполнения функции внутри `computed`/`effect` каждое чтение `.value` запоминается как зависимость. После записи в сигнал функция перезапускается, и список зависимостей перечитывается заново — подписки следуют за фактическим путём выполнения. Декларировать зависимости вручную не нужно.

Следствие: условные зависимости подписываются только на то, что реально читалось:

```ts
// пока show=true, зависит только от a; станет false — переподпишется на b
const c = computed(() => (show.value ? a.value : b.value));
```

### `effect(fn)` — побочный эффект

Запускается сразу и перезапускается при изменении прочитанных сигналов:

```ts
import { effect } from "@dietdev/dom";

effect(() => {
  console.log("счётчик:", count.value);
}); // сразу напечатает текущее значение
```

### `batch(fn)` — одно уведомление на несколько записей

```ts
import { batch } from "@dietdev/dom";

batch(() => {
  a.value = 1;
  b.value = 2;
}); // подписчики уведомлены один раз, после всех записей
```

### `untracked(fn)` — читать без подписки

```ts
import { untracked } from "@dietdev/dom";

const log = computed(() => `=${untracked(() => count.value)}`);
// log не пересчитается при изменении count — зависимость не создана
```

---

## 8. Реактивность в DOM

Главный приём библиотеки: **сигнал можно передать вместо значения** — в ребёнка или в пропс — и DOM будет обновляться сам.

### Сигнал-ребёнок

Строка/число -> `textContent`, `Node` -> замена узла, `null`/`false` -> пусто:

```ts
import { div, span, signal } from "@dietdev/dom";

const count = signal(0);
const node = div("Кликов: ", count);
node.textContent; // "Кликов: 0"

count.value = 5;
node.textContent; // "Кликов: 5" — обновился ровно текстовый узел
```

Реактивная замена узла целиком:

```ts
const view = signal(span("первый"));
const box = div(view); // внутри box — <span>первый</span>
view.value = span("второй"); // <span> заменён на новый, эффекты старого диспозились
view.value = null; // пусто
```

Заменяемый узел диспозится как при `unmount`: эффекты его поддерева останавливаются, утечек нет. Если узел нужен дальше — не передавайте его в signal-ребёнка, управляйте им вручную.

### Сигнал-пропс

Любой пропс может быть сигналом — при изменении патчится ровно он:

```ts
import { button, input, signal } from "@dietdev/dom";

const busy = signal(false);
const btn = button({ disabled: busy }, "Сохранить");
// busy.value = true -> btn.disabled === true

const value = signal("до");
const field = input({ value });
// value.value = "после" -> field.value === "после"
```

### Сигнал в `computed` для производных данных

Когда значение выводится из нескольких сигналов, оберните его в `computed` и передайте computed:

```ts
import { div, signal, computed } from "@dietdev/dom";

const firstName = signal("Ада");
const lastName = signal("Лавлейс");
const full = computed(() => `${firstName.value} ${lastName.value}`);

const nameTag = div(full); // обновится при изменении любого из двух
```

Важно: в ребёнка и пропс кладут **один сигнал**, а не выражение с сигналами — `div(count.value + 1)` запишется один раз и статично. Производные выражения — через `computed`.

---

## 9. Формы и контролируемые поля

`value` и `checked` имеют три режима.

### Режим 1: `Signal` (рекомендуемый)

`value={draft}` связывает поле с сигналом: поле показывает `draft.value` и обновляется при каждом изменении. Ввод пользователя попадает в сигнал обработчиком:

```tsx
const draft = signal("");

<input value={draft} onChange={(e) => (draft.value = (e.target as HTMLInputElement).value)} />;
```

Значением владеет сигнал, но «заморозки» как в React не происходит: сигнал обновляется обработчиком, поле продолжает отвечать на ввод.

### Режим 2: plain-значение + `onChange` — уведомляемое read-only

Ввод пользователя сбрасывается к значению пропса, а обработчик получает событие — годится для валидации или логирования. Автоматического переприменения пропса нет: обновление внешнего состояния в `onChange` не изменит поле (переприменение — только явным повторным `applyProps`):

```ts
const filter = signal("a");
input({ value: filter.value, onChange: (e) => (filter.value = e.target.value) });
// после ввода: filter хранит введённое, а поле вернулось к "a"
```

Для живой связи «поле ↔ состояние» используйте режим 1 (`Signal`).

### Режим 3: plain-значение без `onChange` — read-only

Ввод сбрасывается, один раз выдаётся `console.warn` о поле только для чтения. Полезно для полей, которые меняет только код.

### Неконтролируемый старт: `defaultValue` / `defaultChecked`

Поле инициализируется значением и дальше живёт своей жизнью:

```ts
input({ defaultValue: "можно править" });
input({ type: "checkbox", defaultChecked: true });
```

### Чекбоксы и селекты

Для `input[type=checkbox]`/`radio` контролируется `checked`, для `select` — `value`:

```ts
import { select, option, signal } from "@dietdev/dom";

const city = signal("msk");
select(
  { value: city, onChange: (e) => (city.value = (e.target as HTMLSelectElement).value) },
  option({ value: "msk" }, "Москва"),
  option({ value: "spb" }, "Питер"),
);
```

---

## 10. Списки: `list()`

`list()` строит keyed-список — узлы привязываются к ключам и переиспользуются:

```ts
list(
  source, // Signal<T[]>
  (item) => String(item.id), // keyOf: уникальный стабильный ключ
  (item) => li(item.value), // render: Signal<T> -> Node
);
```

### Минимальный пример

```ts
import { ul, li, signal, computed, list } from "@dietdev/dom";

const items = signal([{ id: 1, text: "хлеб" }]);

const view = ul(
  list(
    items,
    (t) => String(t.id),
    (t) => li(computed(() => t.value.text)), // читайте item через computed!
  ),
);
```

`list()` возвращает не узел, а `ListView` — его передают ребёнком, как сигнал. Список монтируется в родителя и сам поддерживает порядок узлов.

### Что происходит при изменении массива

- ключ сохранился -> узел **не пересоздаётся**, патчится его item-signal;
- ключ новый -> вызывается `render`, создаётся узел;
- ключ исчез -> узел удаляется, его эффекты диспозятся.

### Почему внутри render нужен `computed`

`render` вызывается **один раз** на ключ. Он получает item-**signal**, а не значение. Чтобы DOM реагировал на изменения элемента, читайте этот сигнал реактивно:

```ts
// ПРАВИЛЬНО: содержимое обновляется при патче item-signal
(t) => li(computed(() => t.value.text))

// НЕПРАВИЛЬНО: текст зафиксируется на момент создания
(t) => li(t.value.text)
```

### Обычный обработчик внутри render читает актуальное значение напрямую

```ts
(t) =>
  li(
    computed(() => t.value.text),
    button({ onClick: () => remove(t.value.id) }, "×"), // t.value читается в момент клика
  ),
```

Обработчик выполняется вне системы подписок, поэтому читает `t.value` как обычно.

### Требования к ключам

Ключ должен быть **уникальным** и **стабильным** (один и тот же элемент — один и тот же ключ). Индекс массива годится только если список не пересортируется и не удаляется из середины — иначе переиспождение узлов ломается.

---

## 11. Компоненты

Компонент — просто функция от пропсов, возвращающая узел. Состояние держится в замыкании:

```tsx
import { button, signal } from "@dietdev/dom";

function Counter() {
  const count = signal(0);
  return button({ onClick: () => count.value++ }, "Кликов: ", count);
}
```

### Хелпер `component()`

Добавляет компоненту две формы вызова, как у фабрик — пропсы вперёд, дети после:

```tsx
import { component, li, signal } from "@dietdev/dom";

const Item = component((props: { id: number }, ...children) => {
  return li({ dataset: { id: String(props.id) } }, ...children);
});

Item({ id: 1 }, "текст");
Item("только дети"); // props будет {}
```

### Соглашение о реактивных пропсах

Состояние, которым владеет вызывающий, передавайте как `Signal`; приватное состояние компонента — в замыкании:

```tsx
import { component, computed, input } from "@dietdev/dom";
import type { Signal } from "@dietdev/dom";

const Field = component((props: { value: Signal<string> }) =>
  input({
    value: props.value,
    onChange: (e) => (props.value.value = (e.target as HTMLInputElement).value),
  }),
);
```

Читайте signal-пропсы через `computed` там, где они участвуют в производных данных. При `unmount` эффекты, созданные внутри компонентов, диспозятся наравне с остальными.

---

## 12. JSX

Библиотека поставляет собственный JSX-рантайм (автоматический режим, без React).

### Настройка tsconfig.json

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@dietdev/dom"
  }
}
```

Файлы с разметкой — `.tsx`. Компилятор сам импортирует `jsx`/`jsxs` из `@dietdev/dom/jsx-runtime`, ручные импорты не нужны. Для dev-сборок: `"jsx": "react-jsxdev"` — подключится `@dietdev/dom/jsx-dev-runtime`.

`Fragment` импортируется явно из корня пакета:

```tsx
import { Fragment } from "@dietdev/dom";
```

### Использование

```tsx
import { signal } from "@dietdev/dom";

const count = signal(0);
const app = <button onClick={() => count.value++}>Кликов: {count}</button>;
```

Каждое JSX-выражение — это вызов `h()`: `<div a={1}>x</div>` -> `h("div", { a: 1 }, "x")`. Всё, что верно для фабрик, верно и для JSX.

### Компоненты в JSX

Компонент используется как тег: `<Comp a={1}>child</Comp>` -> `Comp({ a: 1 }, "child")`. Тег с большой буквы — компонент, с маленькой — строковый тег:

```tsx
const Counter = component(() => { /* ... */ });

<Counter />;           // компонент
<section>{list(...)}</section>; // обычный тег, list/сигналы — как дети
```

### Fragment

Группирует детей без родительского узла:

```tsx
const cells = (
  <>
    <td>1</td>
    <td>2</td>
  </>
); // DocumentFragment
```

### Сборщики

Vite подхватывает рантайм из `exports`-подпутей пакета автоматически. Vitest: если он не читает `paths` вашего tsconfig — добавьте зеркальные `resolve.alias`.

---

## 13. Очистка: `unmount()`

Каждый сигнал, привязанный к DOM, живёт пока живёт эффект. Удаление узла из DOM само по себе подписки не убирает — для этого есть явная очистка:

```ts
import { unmount } from "@dietdev/dom";

unmount(app);
```

`unmount(node)`:

1. рекурсивно диспозит все эффекты поддерева (сигналы больше не патчат DOM);
2. удаляет сам узел из родителя.

Вызывайте при уходе со «страницы» или замене поддерева — иначе подписки переживут DOM и будут впустую реагировать на изменения сигналов. `list()` делает это сам для удаляемых элементов.

---

## 14. Смешивание подходов

Фабрики, `h()` и JSX проходят через один слой — комбинируйте свободно, даже внутри одного выражения:

```tsx
import { div, button, h, signal } from "@dietdev/dom";

const mode = signal("view");

const editor = (
  <div class="editor">
    {h("textarea", { rows: 5 })} {/* редкий тег — через h() */}
    {button({ onClick: save }, "OK")} {/* фабрика как JSX-ребёнок */}
  </div>
);
```

Низкоуровневые примитивы — `h`, `applyProps`, `applyProp`, `appendChildren`, `bind`, `unmount` — описаны в README, раздел «Низкоуровневый API»; в руководстве они не разбираются, чтобы не смешивать уровни.

---

## 15. Подводные камни и ограничения

- **Нет SVG.** `createElementNS` не поддерживается.
- **Пропсы не типизированы по тегам.** Опечатка `plaeholder` не поймается компилятором — общий тип `Props`.
- **`key` игнорируется.** Переиспользование узлов — только через `list()`.
- **`onFocus`/`onBlur` не всплывают.** Это DOM-семантика, не React.
- **`render` в `list()` возвращает ровно один узел**, не массив.
- **Забыли `computed` в `render` списка** — содержимое зафиксируется при создании (см. раздел 10).
- **Массив как значение signal/computed** рендерится текстом (`"a,b"`), а не списком — для реактивных коллекций есть `list()` (см. раздел 4).
- **Смена `type` у поля после применения `onChange`** слушатель не переносит: событие (`input`/`change`) выбирается на момент применения пропсов.
- **`div(count.value + 1)`** — вычисляется один раз; производные значения — через `computed`.
- **Удалили узел без `unmount`** — эффекты продолжат работу с отвязанным от DOM узлом.

---

## 16. Итоговый пример

Мини-приложение «задачи», в котором собрано всё: сигналы, computed, формы, keyed-список, JSX.

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

Разберите по частям:

- `todos`, `draft` — сигналы-владельцы состояния (раздел 7);
- `value={draft}` + `onChange` — связка signal -> DOM -> signal (раздел 9);
- `list(todos, keyOf, render)` — keyed-список, чтение item через `computed` (раздел 10);
- `className={computed(...)}` — производный класс (раздел 8).

Живое демо: `npm run dev` (каталог `demo/`). Проверить себя можно тестами: `npm test`.
