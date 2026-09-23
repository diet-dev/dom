import "./tabs.css";
import { component, computed, signal } from "../../src/index.ts";
import type { Child, Signal } from "../../src/index.ts";

export interface TabItem {
  id: string;
  label: string;
  content: Child;
}

export interface TabsProps {
  tabs: TabItem[];
  active?: Signal<string>;
}

export const Tabs = component((props: TabsProps) => {
  const active = props.active ?? signal(props.tabs[0]?.id ?? "");

  return (
    <div class="tabs" role="tabs">
      <div class="tablist" role="tablist">
        {props.tabs.map((tab) => (
          <button
            class={computed(() => (active.value === tab.id ? "tab tab-active" : "tab"))}
            onClick={() => {
              active.value = tab.id;
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {props.tabs.map((tab) => (
        <div class="tabpanel" hidden={computed(() => active.value !== tab.id)}>
          {tab.content}
        </div>
      ))}
    </div>
  );
});
