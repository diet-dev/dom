import { beforeEach, describe, expect, it } from "vitest";
import { ReadmeAutocomplete, readmeApp, readmeCities, readmeDraft, readmeTodos } from "../demo/readme.tsx";
import { unmount } from "../src/index.ts";

function enter(el: HTMLElement) {
  el.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
}

describe("README examples (demo/readme.tsx)", () => {
  beforeEach(() => {
    readmeTodos.value = [{ id: 1, text: "вынести мусор", done: false }];
    readmeDraft.value = "";
  });

  it("todo example renders list, adds items and reacts to done", () => {
    expect(readmeApp.querySelector("h1")?.textContent).toBe("Задачи");
    expect(readmeApp.querySelectorAll("li").length).toBe(readmeTodos.value.length);

    readmeTodos.value = [...readmeTodos.value, { id: 99, text: "из README", done: false }];
    readmeTodos.value = readmeTodos.value.map((t) => (t.id === 1 ? { ...t, done: true } : t));

    const items = [...readmeApp.querySelectorAll("li")];
    expect(items.length).toBe(readmeTodos.value.length);
    expect(items[0].className).toBe("done");
    unmount(readmeApp);
  });

  it("autocomplete example filters by query and submits on Enter", () => {
    const picked: string[] = [];
    const app = ReadmeAutocomplete({
      items: readmeCities,
      query: readmeDraft,
      onsubmit: (item) => picked.push(item),
    });
    document.body.append(app);

    const input = app.querySelector("input")!;
    expect(input).toBeTruthy();

    function type(text: string) {
      input.value = text;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }

    type("моск");
    const dropdown = app.querySelector("ul") as HTMLElement;
    expect(dropdown.hidden).toBe(false);
    expect(dropdown.querySelectorAll("li").length).toBe(1);

    type("мос");
    enter(input);
    expect(picked).toEqual(["мос"]);
    unmount(app);
  });
});
