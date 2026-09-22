import "./autocomplete.css";
import { component, computed, list, signal } from "../src/index.ts";
import type { Signal } from "../src/index.ts";

export interface AutocompleteProps {
  items: Signal<string[]>;
  query: Signal<string>;
  placeholder?: string;
  onsubmit?: (item: string) => void;
}

export const Autocomplete = component((props: AutocompleteProps) => {
  const open = signal(false);
  const filtered = computed(() =>
    props.items.value.filter((i) => i.toLowerCase().includes(props.query.value.trim().toLowerCase())),
  );
  const nothing = computed(() => filtered.value.length === 0);

  return (
    <div class="autocomplete">
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
      <div class="autocomplete-dropdown" hidden={computed(() => !open.value || nothing.value)}>
        <ul class="autocomplete-list">
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
    </div>
  );
});
