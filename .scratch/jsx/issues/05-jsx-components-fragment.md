# 05: Компоненты и Fragment под JSX

Status: done
Blocked by: 04

## Acceptance

- [x] `<Comp a={1}>текст</Comp>` вызывает функцию-компонент с `(props, ...children)`
- [x] `Component<P>` типизируется как JSX-tag (при необходимости через `JSX.ElementType`)
- [x] `<>{a}{b}</>` возвращает `DocumentFragment` с детьми и корректно монтируется в дерево
- [x] Краевые `children`: одиночный, массив, `undefined`/`false`, `Signal`
- [x] Компиляционные негативные кейсы покрыты `@ts-expect-error`
- [x] Гейт `npm run typecheck && npm test` зелёный
