import { describe, expect, it } from "vitest";
import { Autocomplete } from "../demo/autocomplete.tsx";
import { component, signal, unmount } from "../src/index.ts";
import type { Child, Signal } from "../src/index.ts";

function setup(items: string[]) {
  const submitted: string[] = [];
  const query = signal("");
  const itemsSignal = signal(items);
  const app = (
    <div>
      <Autocomplete items={itemsSignal} query={query} onsubmit={(i) => submitted.push(i)} />
    </div>
  ) as HTMLElement;
  document.body.append(app);
  const field = app.querySelector("input") as HTMLInputElement;
  const dropdown = app.querySelector(".autocomplete-dropdown") as HTMLElement;
  const visible = () => [...app.querySelectorAll(".autocomplete-list li")].map((n) => n.textContent);
  return { app, field, dropdown, visible, submitted, query, itemsSignal };
}

describe("autocomplete", () => {
  it("фильтрует подсказки при вводе", () => {
    const { app, field, dropdown, visible } = setup(["Москва", "Минск", "Казань"]);
    field.value = "мо";
    field.dispatchEvent(new Event("input"));
    expect(visible()).toEqual(["Москва"]);
    expect(dropdown.hidden).toBe(false);
    unmount(app);
  });

  it("клик по подсказке подставляет значение в инпут", () => {
    const { app, field, dropdown, query, submitted } = setup(["Москва", "Минск"]);
    field.value = "м";
    field.dispatchEvent(new Event("input"));
    app.querySelector(".autocomplete-list li")!.dispatchEvent(new Event("mousedown"));
    expect(field.value).toBe("Москва");
    expect(query.value).toBe("Москва");
    expect(dropdown.hidden).toBe(true);
    expect(submitted).toEqual([]);
    unmount(app);
  });

  it("подставленное значение отправляется по Enter", () => {
    const { app, field, submitted } = setup(["Москва"]);
    field.value = "м";
    field.dispatchEvent(new Event("input"));
    app.querySelector(".autocomplete-list li")!.dispatchEvent(new Event("mousedown"));
    field.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(submitted).toEqual(["Москва"]);
    unmount(app);
  });

  it("Enter вызывает onsubmit с введённым текстом", () => {
    const { app, field, submitted } = setup(["Москва"]);
    field.value = "Тверь";
    field.dispatchEvent(new Event("input"));
    field.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(submitted).toEqual(["Тверь"]);
    unmount(app);
  });

  it("blur закрывает dropdown", () => {
    const { app, field, dropdown } = setup(["Москва", "Минск"]);
    field.value = "м";
    field.dispatchEvent(new Event("input"));
    expect(dropdown.hidden).toBe(false);
    field.dispatchEvent(new Event("blur"));
    expect(dropdown.hidden).toBe(true);
    unmount(app);
  });

  it("без совпадений dropdown скрыт", () => {
    const { app, field, dropdown } = setup(["Москва"]);
    field.value = "пар";
    field.dispatchEvent(new Event("input"));
    expect(dropdown.hidden).toBe(true);
    unmount(app);
  });

  it("реагирует на изменение items: список подсказок обновляется", () => {
    const { app, field, visible, itemsSignal } = setup(["Москва"]);
    field.value = "п";
    field.dispatchEvent(new Event("input"));
    expect(visible()).toEqual([]);
    itemsSignal.value = [...itemsSignal.value, "Псков"];
    expect(visible()).toEqual(["Псков"]);
    unmount(app);
  });

  it("сквозной сценарий: фильтр → pick → unmount", () => {
    const { app, field, query, submitted, itemsSignal } = setup(["Москва", "Минск", "Мурманск"]);

    field.value = "м";
    field.dispatchEvent(new Event("input"));
    expect([...app.querySelectorAll(".autocomplete-list li")]).toHaveLength(3);

    field.value = "му";
    field.dispatchEvent(new Event("input"));
    const items = [...app.querySelectorAll(".autocomplete-list li")];
    expect(items.map((li) => li.textContent)).toEqual(["Мурманск"]);

    items[0].dispatchEvent(new Event("mousedown"));
    expect(query.value).toBe("Мурманск");
    expect(field.value).toBe("Мурманск");

    itemsSignal.value = [];
    expect(app.querySelectorAll(".autocomplete-list li")).toHaveLength(0);

    field.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(submitted).toEqual(["Мурманск"]);

    unmount(app);
    expect(app.parentNode).toBeNull();
    expect(document.body.contains(field)).toBe(false);

    query.value = "изменение после unmount не бросает";
    itemsSignal.value = ["после unmount"];
    expect(app.querySelectorAll(".autocomplete-list li")).toHaveLength(0);
  });
});

describe("component()", () => {
  it("вызывается как тег: пропсы + дети", () => {
    const render = component(
      (props: { class?: string }, ...children: Child[]) => <div class={props.class}>{children}</div>,
    );
    const node = render({ class: "x" }, <span>внутри</span>) as HTMLElement;
    expect(node.className).toBe("x");
    expect(node.textContent).toBe("внутри");
  });

  it("вызывается как тег: только дети, props — пустой объект", () => {
    let seen: unknown = "не вызывался";
    const render = component((props: { class?: string }, ...children: Child[]) => {
      seen = props;
      return <div>{children}</div>;
    });
    const node = render(<span>текст</span>) as HTMLElement;
    expect(seen).toEqual({});
    expect(node.textContent).toBe("текст");
  });

  it("null-пропсы превращаются в пустой объект", () => {
    let seen: unknown = null;
    const render = component((props: { a?: number }) => {
      seen = props;
      return <div />;
    });
    render(null);
    expect(seen).toEqual({});
  });

  it("вызывается как тег: без аргументов", () => {
    const render = component(() => <div>ок</div>);
    expect((render() as HTMLElement).textContent).toBe("ок");
  });

  it("Signal в пропсах компонента доходит до DOM реактивно", () => {
    const value: Signal<string> = signal("a");
    const Box = component((props: { v: Signal<string> }) => <span>{props.v}</span>);
    const node = Box({ v: value }) as HTMLElement;
    expect(node.textContent).toBe("a");
    value.value = "b";
    expect(node.textContent).toBe("b");
  });
});
