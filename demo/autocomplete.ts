import "./autocomplete.css";
import { component } from "../src/index.ts";
import type { Signal } from "../src/index.ts";
import { computed, signal } from "../src/index.ts";
import { list } from "../src/index.ts";
import { div, input, li, ul } from "../src/index.ts";

export interface AutocompleteProps {
  items: Signal<string[]>;
  query: Signal<string>;
  placeholder?: string;
  onsubmit?: (item: string) => void;
}

export const autocomplete = component((props: AutocompleteProps) => {
  const open = signal(false);
  const filtered = computed(() =>
    props.items.value.filter((i) =>
      i.toLowerCase().includes(props.query.value.trim().toLowerCase()),
    ),
  );
  const nothing = computed(() => filtered.value.length === 0);

  return div(
    { class: "autocomplete" },
    input({
      placeholder: props.placeholder,
      value: props.query,
      oninput: (e) => {
        props.query.value = (e.target as HTMLInputElement).value;
        open.value = true;
      },
      onkeydown: (e) => {
        if ((e as KeyboardEvent).key === "Enter") {
          open.value = false;
          props.onsubmit?.(props.query.value);
        }
      },
      onblur: () => {
        open.value = false;
      },
    }),
    div(
      {
        class: "autocomplete-dropdown",
        hidden: computed(() => !open.value || nothing.value),
      },
      ul(
        { class: "autocomplete-list" },
        list(
          filtered,
          (i) => i,
          (i) =>
            li(
              {
                onmousedown: () => {
                  props.query.value = i.peek();
                  open.value = false;
                },
              },
              computed(() => i.value),
            ),
        ),
      ),
    ),
  );
});
