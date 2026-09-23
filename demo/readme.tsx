// Копия примера из README — проверяется этим модулем и тестом test/readme.test.tsx.
// Держите синхронным с README.md при изменении примера.
import { computed, list, signal } from "../src/index.ts";

interface Todo {
  id: number;
  text: string;
  done: boolean;
}

export const readmeTodos = signal<Todo[]>([{ id: 1, text: "вынести мусор", done: false }]);
export const readmeDraft = signal("");

function readmeAdd() {
  const text = readmeDraft.value.trim();
  if (!text) return;
  readmeTodos.value = [...readmeTodos.value, { id: Date.now(), text, done: false }];
  readmeDraft.value = "";
}

export const readmeApp = (
  <div className="app">
    <h1>Задачи</h1>
    <ul>
      {list(
        readmeTodos,
        (t) => String(t.id),
        (t) => (
          <li className={computed(() => (t.value.done ? "done" : ""))}>{computed(() => t.value.text)}</li>
        ),
      )}
    </ul>
    <input
      placeholder="Новая задача"
      value={readmeDraft}
      onChange={(e) => (readmeDraft.value = (e.target as HTMLInputElement).value)}
      onKeyDown={(e) => {
        if ((e as KeyboardEvent).key === "Enter") readmeAdd();
      }}
    />
    <button onClick={readmeAdd}>Добавить</button>
  </div>
);
