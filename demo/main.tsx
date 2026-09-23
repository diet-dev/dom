import "./style.css";
import { Tabs, counterTab, todosTab } from "./tabs/index.ts";

const demoTabs = [
  { id: "counter", label: "Счётчик", content: counterTab },
  { id: "todos", label: "Задачи", content: todosTab },
];

const app = (
  <div class="app">
    <h1>Демо: библиотека Dom</h1>
    <Tabs tabs={demoTabs} />
  </div>
);

document.getElementById("app")?.replaceChildren(app);
