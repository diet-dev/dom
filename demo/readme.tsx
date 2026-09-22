// Копии примеров из README — проверяются этим модулем и тестом test/readme.test.tsx.
// Держите синхронным с README.md при изменении примеров.
import { component, computed, list, signal } from "../src/index.ts";
import type { Signal } from "../src/index.ts";

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

export const readmeCities = signal(["Москва", "Санкт-Петербург", "Новосибирск"]);

interface ReadmeAutocompleteProps {
  items: Signal<string[]>;
  query: Signal<string>;
  placeholder?: string;
  onsubmit?: (item: string) => void;
}

export const ReadmeAutocomplete = component((props: ReadmeAutocompleteProps) => {
  const open = signal(false);
  const filtered = computed(() =>
    props.items.value.filter((i) => i.toLowerCase().includes(props.query.value.trim().toLowerCase())),
  );
  return (
    <div className="autocomplete">
      <input
        placeholder={props.placeholder}
        value={props.query}
        onChange={(e) => {
          props.query.value = (e.target as HTMLInputElement).value;
          open.value = true;
        }}
        onKeyDown={(e) => {
          if ((e as KeyboardEvent).key === "Enter") {
            open.value = false;
            props.onsubmit?.(props.query.value);
          }
        }}
        onBlur={() => {
          open.value = false;
        }}
      />
      <ul hidden={computed(() => !open.value || filtered.value.length === 0)}>
        {list(
          filtered,
          (i) => i,
          (i) => (
            <li
              onMouseDown={() => {
                props.query.value = i.peek();
                open.value = false;
              }}
            >
              {computed(() => i.value)}
            </li>
          ),
        )}
      </ul>
    </div>
  );
});
