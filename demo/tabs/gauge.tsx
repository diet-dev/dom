import { computed, signal } from "../../src/index.ts";

const level = signal(40);

const state = computed(() => (level.value > 80 ? "gauge-over" : level.value > 50 ? "gauge-warn" : "gauge-ok"));
const fade = computed(() => `opacity: ${(0.4 + level.value / 250).toFixed(2)}`);

export const gaugeTab = (
  <section class="card">
    <h2>Датчик — сигналы в class, style и атрибутах svg</h2>
    <svg class="gauge" viewBox="0 0 100 30">
      <rect class="gauge-track" x={2} y={14} width={96} height={6} rx={3} />
      <rect
        class={state}
        x={2}
        y={14}
        height={6}
        rx={3}
        width={computed(() => Math.max(2, level.value * 0.96).toFixed(1))}
        style={fade}
      />
      <text class="gauge-label" x={50} y={9} textAnchor="middle">
        {computed(() => `${level.value}%`)}
      </text>
    </svg>
    <input
      type="range"
      min={0}
      max={100}
      value={level}
      aria-label="Уровень"
      onChange={(e) => (level.value = Number((e.target as HTMLInputElement).value))}
    />
  </section>
);
