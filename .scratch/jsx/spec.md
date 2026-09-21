# Спека: JSX-слой

Аддитивный JSX-слой для `@dietdev/dom`: автоматический рантайм, React-совместимые пропсы, миграция демо/тестов/README. Ядро (`h`, `tags`, `bind`, `list`) не переписывается.

## Цель

Разрешить писать код «как в React» — `<div className="x" onClick={...}>…</div>` — поверх существующих фабрик и сигналов, без виртуального DOM.

## Решения

- **Режим**: автоматический (`jsx: "react-jsx"` + `jsxImportSource: "@dietdev/dom"`). Не классический `jsxFactory`.
- **React-нормализация — в ядре** (`applyProps`), единый контракт для JSX, `h()`, `tags`, `component()`. Ломающее изменение относительно DOM-контракта 0.1.0.
- **`key`** вырезается и игнорируется; keyed-реконсиляция — только через `list()`.
- **React-совместимость — максимум**: алиасы имён, карта событий, controlled inputs, `defaultValue`/`defaultChecked`, `ref`-объект.
- **Интринсик-теги — пермиссивные** (`[tag: string]: Props`); строгая типизация имён — вне v1.
- **Версия**: 0.1.0 → 0.2.0.

## Архитектура

Новые модули (`.ts`, попадают в существующий build без правок emit):

- **`src/jsx-runtime.ts`** — публичный подпуть `@dietdev/dom/jsx-runtime`. Экспортирует `jsx`, `jsxs`, `jsxDEV`, `Fragment` и namespace `JSX`. Отрезает `key`, распаковывает `props.children`, диспатчит: строка → `h(type, rest, ...children)`, функция → `type(rest, ...children)`.
- **`src/jsx-dev-runtime.ts`** — реэкспорт из `jsx-runtime` (+ `jsxDEV`) для `jsx: react-jsxdev`.
- **`src/react-compat.ts`** — глубокий модуль нормализации: алиасы имён, карта React-событий, controlled-логика. Единственное место, знающее про React; тестируется изолированно.

Изменяемые модули:

- **`src/h.ts`** — `applyProps`/`applyProp` делегируют нормализацию в `react-compat`; попутно чинятся дефекты ревью: регистр `readonly` → `readOnly`, порядок `value` для `select` (после детей), сброс DOM при Signal-пропе, ставшем `null`.
- **`src/tags.ts` / `src/component.ts` / `src/index.ts`** — экспорт `Fragment` и типов `JSX`. Сигнатуры `Factory`/`Component` (`(props?, ...children)`) не меняются.

## Контракт пропсов

Нормализуется в `react-compat` и применяется в `applyProps` для всех путей.

**Имена**
- `className` → `class`
- `htmlFor` → `for`
- `key` → игнорируется (не атрибут); в рантайме отрезается до вызова `h`

**События `on*`**
- База: `onFoo` → `addEventListener("foo")`.
- Карта исключений, где React-имя ≠ DOM event type: `onDoubleClick` → `dblclick`. Прочие React-имена (`onMouseEnter`, `onKeyDown`, `onSubmit`, `onFocus`, `onBlur`, …) лоуэрятся в корректный DOM-тип автоматически.
- `onChange` — элемент-зависимо:
  - текстовый/числовой `input` и `textarea` → событие `input`;
  - `select`, `input[type=checkbox|radio|file]` → событие `change`.
- Отступление: React `onFocus`/`onBlur` всплывают, здесь остаются DOM `focus`/`blur` (не всплывают).

**Булевы / регистр IDL-свойств**
Таблица «React-имя → DOM-свойство» вместо lowercase-`BOOLEAN_PROPS`: `readOnly` → `readOnly`, `autoFocus` → `autofocus`, `disabled`/`checked`/`required`/`selected`/`multiple`/`hidden` — как есть.

**Значения по умолчанию**
- `defaultValue` → `el.defaultValue`, `defaultChecked` → `el.defaultChecked` (uncontrolled-старт).

**Controlled inputs**
- `value`/`checked` = `Signal` → существующий bind через `effect`; React-логика не применяется (значением владеет сигнал).
- `value`/`checked` plain **+** `onChange` → controlled: `WeakMap` хранит применённое значение; на соответствующем событии (`input`/`change`) после обработчиков значение сбрасывается к prop (как React без обновления состояния).
- `value`/`checked` plain **без** `onChange` → read-only: сброс значения на соответствующем событии + `console.warn` (всегда; зависимость от `process.env` не вводим, чтобы не ломать браузерную сборку).
- Идиоматичное редактирование — `value={signal}` + `onChange`.

**`ref`**
- Callback `(el) => void` (как сейчас) и React-объект `{ current }` → присваиваем `current`.

**Без изменений**: `style`, `dataset`, прочее → `setAttribute`.

**Типы.** Явные поля `Props` для DX: `className?`, `htmlFor?`, `onChange?`, `defaultValue?`, `readOnly?`, `key?` (индексная сигнатура уже есть).

## JSX-рантайм и типы

```ts
export namespace JSX {
  type Element = Node;
  interface ElementChildrenAttribute { children: {}; }
  interface IntrinsicElements { [tag: string]: Props; }
}
```

- `Element = Node`, потому что `Fragment` возвращает `DocumentFragment`; цена — тип `<div/>`-выражения `Node`, не `HTMLElement`.
- `Fragment` — сентинел; `jsx(Fragment, props)` строит `DocumentFragment`.
- Компоненты: `<Comp a={1}>child</Comp>` → `Comp({a:1}, "child")`. Для перегрузки `Component<P>` при необходимости заводится `JSX.ElementType`; покрывается компиляционным тестом.
- Массивы детей без `key` не предупреждают; dev-warnings React не эмулируются.

## Тулинг и сборка

- **tsconfig.json**: `"jsx": "react-jsx"`, `"jsxImportSource": "@dietdev/dom"`, `.tsx` в `include`, плюс `paths`:
  ```
  "@dietdev/dom": ["./src/index.ts"],
  "@dietdev/dom/jsx-runtime": ["./src/jsx-runtime.ts"],
  "@dietdev/dom/jsx-dev-runtime": ["./src/jsx-dev-runtime.ts"]
  ```
- **Vite и Vitest** не читают `paths` — зеркальные `resolve.alias` в `vite.config.ts` и `vitest.config.ts`. Транспайл `.tsx` — из `tsconfig.json`.
- **package.json `exports`**: новые подпути `"./jsx-runtime"`, `"./jsx-dev-runtime"` (types + default).
- **tsconfig.build.json**: без правок (`src/**/*.ts`, `rewriteRelativeImportExtensions`) — эмитит `dist/jsx-runtime.js` + `.d.ts`.
- **SSR**: рантайм не трогает `document` на импорте; `sideEffects: false` сохраняется.
- `demo/index.html` → `main.tsx`.

## Миграция

- `demo/autocomplete.ts` → `.tsx`: компонент в JSX, поведение из issue 08 (внешний `query`, `onsubmit`, дедуп) сохраняется.
- `demo/main.ts` → `.tsx`: демка задач в JSX.
- `test/component.test.ts` → `.tsx`; новые `test/jsx.test.tsx` и `test/react-compat.test.tsx`. Логические тесты остаются `.ts`.
- README: раздел «JSX», пропсы на React-имена, примеры автокомплита и `component()` приводятся к текущему API.

## Тесты

- Unit `react-compat`: алиасы, карта событий, controlled-сброс, `defaultValue`/`defaultChecked`, `ref`-объект.
- Unit `jsx-runtime`: диспатч string/function/`Fragment`, распаковка `children`, отрезание `key`.
- Компиляционные: `.tsx`-фикстура в общем typecheck; негативные кейсы через `@ts-expect-error`.
- Интеграционный: JSX-автокомплит сквозь фильтр → pick → unmount.
- Гейт: `npm run typecheck && npm test && npm run build`; существующие тесты остаются зелёными.

## Вне скоупа v1

SVG, типизация пропсов и имён по тегам, `key` → реконсиляция, `dangerouslySetInnerHTML`, числа→`px` в `style`, React-dev-warnings, хуки/состояние, React DevTools. Смеллы из ревью, не связанные с пропсами (`index.ts`-реэкспорты, мёртвый `.remove()` и т.п.), — отдельной задачей.

## Риски

- Перегрузка `Component<P>` как JSX-tag может не выводиться TS — митигация `JSX.ElementType` + компиляционный тест.
- Controlled-логика без vdom: plain-`value` с `onChange` «заморожен», пока не обновлён внешний источник; идиома — `Signal`.
