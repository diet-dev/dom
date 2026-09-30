import { describe, expect, it, vi } from "vitest";
import { component } from "../src/component.ts";
import type { Child } from "../src/h.ts";
import { div, p, span } from "../src/tags.ts";
import { signal } from "../src/signals.ts";
import { Fragment, jsx, jsxs } from "../src/jsx-runtime.ts";

type ItemProps = { a: number };

const Item = component((props: ItemProps, ...children: Child[]) => div({ "data-a": String(props.a) }, ...children));

describe("JSX: компоненты", () => {
  it("<Comp a={1}>текст</Comp> вызывает функцию-компонент с (props, ...children)", () => {
    const render = vi.fn((props: ItemProps, ...children: Child[]) => div({ "data-a": String(props.a) }, ...children));
    const Comp = component(render);
    const node = (<Comp a={1}>текст</Comp>) as HTMLElement;
    expect(render).toHaveBeenCalledTimes(1);
    const [calledProps, ...calledChildren] = render.mock.calls[0];
    expect(calledProps).toEqual({ a: 1 });
    expect(calledChildren).toEqual(["текст"]);
    expect(node.tagName).toBe("DIV");
    expect(node.getAttribute("data-a")).toBe("1");
    expect(node.textContent).toBe("текст");
  });

  it("компонент без детей и с несколькими детьми", () => {
    const noChildren = (<Item a={2} />) as HTMLElement;
    expect(noChildren.textContent).toBe("");
    const multi = (
      <Item a={3}>
        <span>один</span>
        <span>два</span>
      </Item>
    ) as HTMLElement;
    expect(multi.children).toHaveLength(2);
  });

  it("вложенные компоненты", () => {
    const Wrapper = component((_props: { children?: Child | Child[] }, ...children: Child[]) => sectionLike(children));
    const node = (
      <Wrapper>
        <Item a={5}>внутри</Item>
      </Wrapper>
    ) as HTMLElement;
    expect((node.firstChild as HTMLElement).getAttribute("data-a")).toBe("5");
  });

  it("Component<P> типизируется как JSX-tag: позитивные и негативные кейсы", () => {
    const node = (<Item a={7} />) as HTMLElement;
    expect(node.getAttribute("data-a")).toBe("7");
    // @ts-expect-error a должен быть number
    const badType = <Item a="семь" />;
    void badType;
    // @ts-expect-error пропущен обязательный проп a
    const badMissing = <Item />;
    void badMissing;
  });
});

describe("JSX: Fragment", () => {
  it("<>{a}{b}</> возвращает DocumentFragment с детьми", () => {
    const frag = (
      <>
        <span>a</span>
        <span>b</span>
      </>
    );
    expect(frag).toBeInstanceOf(DocumentFragment);
    expect(frag.childNodes).toHaveLength(2);
    expect(frag.firstChild?.textContent).toBe("a");
    expect(frag.lastChild?.textContent).toBe("b");
  });

  it("Fragment монтируется в дерево: дети попадают в родителя", () => {
    const node = (
      <div>
        <>
          <span>один</span>
          <span>два</span>
        </>
        <span>три</span>
      </div>
    ) as HTMLElement;
    expect(node.children).toHaveLength(3);
    expect(node.textContent).toBe("одиндватри");
  });

  it("Fragment c явным вызовом jsxs и сигналом внутри", () => {
    const name = signal("Аня");
    const frag = jsxs(Fragment, { children: [<p>Привет</p>, name] });
    expect(frag).toBeInstanceOf(DocumentFragment);
    const host = div();
    host.append(frag);
    expect(host.textContent).toBe("ПриветАня");
    name.value = "Борис";
    expect(host.textContent).toBe("ПриветБорис");
  });

  it("undefined/false внутри Fragment пропускаются", () => {
    const frag = (
      <>
        {undefined}
        {false}
        <span>ок</span>
      </>
    ) as DocumentFragment;
    expect(frag.childNodes).toHaveLength(1);
    expect(frag.textContent).toBe("ок");
  });

  it("jsx(Fragment, ...) c единственным ребёнком", () => {
    const frag = jsx(Fragment, { children: <span>один</span> });
    expect(frag.childNodes).toHaveLength(1);
  });
});

describe("JSX: краевые children", () => {
  it("undefined и false пропускаются", () => {
    const maybeText: string | undefined = undefined;
    const maybeNode: false = false;
    const node = (
      <div>
        {maybeText}
        {maybeNode}
        <span>ок</span>
      </div>
    );
    expect(node.childNodes).toHaveLength(1);
    expect(node.textContent).toBe("ок");
  });

  it("массив детей в компоненте", () => {
    const items = [<span key="1">один</span>, <span key="2">два</span>];
    const node = (<Item a={1}>{items}</Item>) as HTMLElement;
    expect(node.children).toHaveLength(2);
  });

  it("Signal как child компонента", () => {
    const name = signal("Аня");
    const node = (
      <div>
        <Item a={1}>Привет, {name}!</Item>
      </div>
    ) as HTMLElement;
    const inner = node.firstChild as HTMLElement;
    expect(inner.textContent).toBe("Привет, Аня!");
    name.value = "Борис";
    expect(inner.textContent).toBe("Привет, Борис!");
  });
});

function sectionLike(children: Child[]): HTMLElement {
  return div({ class: "wrapper" }, ...children);
}
