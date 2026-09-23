import { computed, signal } from "../../src/index.ts";

const count = signal(0);

export const counterTab = (
  <section class="card">
    <h2>Счётчик</h2>
    <div class="row">
      <button onClick={() => count.value--}>−</button>
      <span class="count">{computed(() => String(count.value))}</span>
      <button onClick={() => count.value++}>+</button>
    </div>
  </section>
);
