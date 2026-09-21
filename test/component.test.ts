import { describe, expect, it } from "vitest";
import { autocomplete } from "../demo/autocomplete.ts";
import { component } from "../src/index.ts";
import { signal } from "../src/index.ts";
import { div, span } from "../src/index.ts";
import { unmount } from "../src/index.ts";

function setup(items: string[]) {
  const submitted: string[] = [];
  const query = signal("");
  const app = div(
    autocomplete({
      items: signal(items),
      query,
      onsubmit: (i) => submitted.push(i),
    }),
  );
  document.body.append(app);
  const field = app.querySelector("input") as HTMLInputElement;
  const dropdown = app.querySelector(".autocomplete-dropdown") as HTMLElement;
  const visible = () =>
    [...app.querySelectorAll(".autocomplete-list li")].map(
      (n) => n.textContent,
    );
  return { app, field, dropdown, visible, submitted, query };
}

describe("autocomplete", () => {
  it("фильтрует подсказки при вводе", () => {
    const { app, field, dropdown, visible } = setup([
      "Москва",
      "Минск",
      "Казань",
    ]);
    field.value = "мо";
    field.dispatchEvent(new Event("input"));
    expect(visible()).toEqual(["Москва"]);
    expect(dropdown.hidden).toBe(false);
    unmount(app);
  });

  it("клик по подсказке подставляет значение в инпут", () => {
    const { app, field, dropdown, query, submitted } = setup([
      "Москва",
      "Минск",
    ]);
    field.value = "м";
    field.dispatchEvent(new Event("input"));
    app
      .querySelector(".autocomplete-list li")!
      .dispatchEvent(new Event("mousedown"));
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
    app
      .querySelector(".autocomplete-list li")!
      .dispatchEvent(new Event("mousedown"));
    field.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );
    expect(submitted).toEqual(["Москва"]);
    unmount(app);
  });

  it("Enter вызывает onsubmit с введённым текстом", () => {
    const { app, field, submitted } = setup(["Москва"]);
    field.value = "Тверь";
    field.dispatchEvent(new Event("input"));
    field.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );
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
});

describe("component()", () => {
  it("вызывается как тег: пропсы + дети", () => {
    const render = component((props: { class?: string }, ...children) =>
      div({ class: props.class }, ...children),
    );
    const node = render({ class: "x" }, span("внутри"));
    expect(node.className).toBe("x");
    expect(node.textContent).toBe("внутри");
  });

  it("вызывается как тег: только дети, props — пустой объект", () => {
    let seen: unknown = "не вызывался";
    const render = component((props: { class?: string }, ...children) => {
      seen = props;
      return div(...children);
    });
    const node = render(span("текст"));
    expect(seen).toEqual({});
    expect(node.textContent).toBe("текст");
  });

  it("null-пропсы превращаются в пустой объект", () => {
    let seen: unknown = null;
    const render = component((props: { a?: number }) => {
      seen = props;
      return div();
    });
    render(null);
    expect(seen).toEqual({});
  });

  it("вызывается как тег: без аргументов", () => {
    const render = component((props: Record<string, never>) => div("ок"));
    expect(render().textContent).toBe("ок");
  });
});
