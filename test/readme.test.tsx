import { beforeEach, describe, expect, it } from "vitest";
import { readmeApp, readmeDraft, readmeTodos } from "../demo/readme.tsx";
import { unmount } from "../src/index.ts";

describe("README example (demo/readme.tsx)", () => {
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
});
