import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const path = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@dietdev\/dom\/jsx-dev-runtime$/, replacement: path("src/jsx-dev-runtime.ts") },
      { find: /^@dietdev\/dom\/jsx-runtime$/, replacement: path("src/jsx-runtime.ts") },
      { find: /^@dietdev\/dom$/, replacement: path("src/index.ts") },
    ],
  },
  test: {
    environment: "jsdom",
  },
});
