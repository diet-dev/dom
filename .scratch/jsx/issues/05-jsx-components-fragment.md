# 05: Компоненты и Fragment под JSX

Status: ready-for-agent
Blocked by: 04

## Acceptance

- [ ] `<Comp a={1}>текст</Comp>` вызывает функцию-компонент с `(props, ...children)`
- [ ] `Component<P>` типизируется как JSX-tag (при необходимости через `JSX.ElementType`)
- [ ] `<>{a}{b}</>` возвращает `DocumentFragment` с детьми и корректно монтируется в дерево
- [ ] Краевые `children`: одиночный, массив, `undefined`/`false`, `Signal`
- [ ] Компиляционные негативные кейсы покрыты `@ts-expect-error`
- [ ] Гейт `npm run typecheck && npm test` зелёный
