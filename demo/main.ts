import "./style.css";
import { computed, signal } from "../src/index.ts";
import {
  button,
  div,
  h1,
  h2,
  input,
  li,
  list,
  section,
  span,
  ul,
} from "../src/index.ts";

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

function addTodo() {
  const text = draft.value.trim();
  if (!text) return;
  todos.value = [...todos.value, { id: nextId++, text }];
  draft.value = "";
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
      input({
        placeholder: "Новая задача",
        value: draft,
        oninput: (e: Event) => {
          draft.value = (e.target as HTMLInputElement).value;
        },
        onkeydown: (e: Event) => {
          if ((e as KeyboardEvent).key === "Enter") addTodo();
        },
      }),
      button({ onclick: addTodo }, "Добавить"),
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
