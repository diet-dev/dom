import "./style.css";
import { computed, signal } from "../src/index.ts";
import {
  button,
  div,
  h1,
  h2,
  li,
  list,
  section,
  span,
  ul,
} from "../src/index.ts";
import { autocomplete } from "./autocomplete.ts";

interface Todo {
  id: number;
  text: string;
}

let nextId = 1;
const count = signal(0);
const todos = signal<Todo[]>([
  { id: nextId++, text: "разобраться с signals" },
  { id: nextId++, text: "написать свою dom-библиотеку" },
]);
const draft = signal("");
const presets = ["полить цветы", "ответить на письма", "сделать зарядку"];
const suggestions = computed(() => [
  ...new Set([...presets, ...todos.value.map((t) => t.text)]),
]);

function addTodo(text: string): boolean {
  const value = text.trim();
  if (!value) return false;
  if (todos.value.some((t) => t.text === value)) return false;
  todos.value = [...todos.value, { id: nextId++, text: value }];
  return true;
}

function submit() {
  if (addTodo(draft.value)) draft.value = "";
}

function removeTodo(id: number) {
  todos.value = todos.value.filter((t) => t.id !== id);
}

const app = div(
  { class: "app" },
  h1("Демо: библиотека Dom"),
  section(
    { class: "card" },
    h2("Счётчик"),
    div(
      { class: "row" },
      button({ onclick: () => count.value-- }, "−"),
      span(
        { class: "count" },
        computed(() => String(count.value)),
      ),
      button({ onclick: () => count.value++ }, "+"),
    ),
  ),
  section(
    { class: "card" },
    h2("Задачи — keyed-список"),
    div(
      { class: "row" },
      autocomplete({
        items: suggestions,
        query: draft,
        placeholder: "Новая задача — клик по подсказке подставит значение",
        onsubmit: submit,
      }),
      button({ onclick: submit }, "Добавить"),
    ),
    ul(
      { class: "todos" },
      list(
        todos,
        (t) => String(t.id),
        (t) =>
          li(
            span(computed(() => t.value.text)),
            button(
              { class: "remove", onclick: () => removeTodo(t.value.id) },
              "×",
            ),
          ),
      ),
    ),
  ),
);

document.getElementById("app")?.replaceChildren(app);
