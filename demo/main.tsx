import "./style.css";
import { computed, list, signal } from "../src/index.ts";
import { Autocomplete } from "./autocomplete.tsx";

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
const suggestions = computed(() => [...new Set([...presets, ...todos.value.map((t) => t.text)])]);

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

const app = (
  <div class="app">
    <h1>Демо: библиотека Dom</h1>
    <section class="card">
      <h2>Счётчик</h2>
      <div class="row">
        <button onClick={() => count.value--}>−</button>
        <span class="count">{computed(() => String(count.value))}</span>
        <button onClick={() => count.value++}>+</button>
      </div>
    </section>
    <section class="card">
      <h2>Задачи — keyed-список</h2>
      <div class="row">
        <Autocomplete
          items={suggestions}
          query={draft}
          placeholder="Новая задача — клик по подсказке подставит значение"
          onsubmit={submit}
        />
        <button onClick={submit}>Добавить</button>
      </div>
      <ul class="todos">
        {list(
          todos,
          (t) => String(t.id),
          (t) => (
            <li>
              <span>{computed(() => t.value.text)}</span>
              <button class="remove" onClick={() => removeTodo(t.value.id)}>
                ×
              </button>
            </li>
          ),
        )}
      </ul>
    </section>
  </div>
);

document.getElementById("app")?.replaceChildren(app);
