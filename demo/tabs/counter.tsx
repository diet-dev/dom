import { computed, signal } from "../../src/index.ts";
import { Icon } from "../icons.tsx";

const count = signal(0);

export const counterTab = (
  <section class="card">
    <h2>Счётчик</h2>
    <div class="row">
      <button onClick={() => count.value--} aria-label="Уменьшить">
        <Icon name="minus" />
      </button>
      <span class="count">{computed(() => String(count.value))}</span>
      <button onClick={() => count.value++} aria-label="Увеличить">
        <Icon name="plus" />
      </button>
    </div>
  </section>
);
