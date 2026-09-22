import { describe, expect, it } from "vitest";
import { component, computed, list, signal } from "../src/index.ts";
import type { Child } from "../src/index.ts";

describe("JSX: сквозной рендер", () => {
  it("вложенные элементы, компоненты и Signal-children в одном дереве", () => {
    const name = signal("Аня");
    const Card = component(
      (props: { title: string }, ...children: Child[]) => (
        <section class="card">
          <h2>{props.title}</h2>
          {children}
        </section>
      ),
    );
    const node = (
      <main class="app">
        <Card title="Привет">
          <p>Привет, {name}!</p>
        </Card>
      </main>
    ) as HTMLElement;
    expect(node.tagName).toBe("MAIN");
    expect(node.querySelector("h2")?.textContent).toBe("Привет");
    expect(node.querySelector("p")?.textContent).toBe("Привет, Аня!");
    name.value = "Борис";
    expect(node.querySelector("p")?.textContent).toBe("Привет, Борис!");
  });

  it("keyed-список как JSX-child реактивно обновляется", () => {
    const todos = signal([
      { id: 1, text: "раз" },
      { id: 2, text: "два" },
    ]);
    const node = (
      <ul class="todos">
        {list(todos, (t) => String(t.id), (t) => (
          <li key={t.value.id}>{computed(() => t.value.text)}</li>
        ))}
      </ul>
    ) as HTMLElement;
    const items = () => [...node.querySelectorAll("li")].map((li) => li.textContent);
    expect(items()).toEqual(["раз", "два"]);
    todos.value = [...todos.value, { id: 3, text: "три" }];
    expect(items()).toEqual(["раз", "два", "три"]);
  });

  it("булевы и null/false children пропускаются, числа рендерятся", () => {
    const text = signal("да");
    const node = (
      <p>
        {text}
        {null}
        {undefined}
        {7}
      </p>
    ) as HTMLElement;
    expect(node.textContent).toBe("да7");
    text.value = "нет";
    expect(node.textContent).toBe("нет7");
  });

  it("Signal-атрибут реактивно обновляет DOM", () => {
    const hidden = signal(false);
    const node = <div hidden={hidden}>контент</div> as HTMLElement;
    expect(node.hidden).toBe(false);
    hidden.value = true;
    expect(node.hidden).toBe(true);
  });
});
