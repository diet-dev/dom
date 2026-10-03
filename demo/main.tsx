import "./style.css";
import type { TabItem } from "./tabs/index.ts";
import { Tabs, counterTab, gaugeTab, todosTab } from "./tabs/index.ts";

const demoTabs: TabItem[] = [
  { id: "counter", label: "Счётчик", icon: "hash", content: counterTab },
  { id: "gauge", label: "Датчик", icon: "gauge", content: gaugeTab },
  { id: "todos", label: "Задачи", icon: "list", content: todosTab },
];

const app = (
  <div class="app">
    <h1>Демо: библиотека Dom</h1>
    <Tabs tabs={demoTabs} />
  </div>
);

document.getElementById("app")?.replaceChildren(app);
