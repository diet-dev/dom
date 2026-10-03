import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

const path = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  root: "demo",
  base: "./",
  resolve: {
    alias: [
      { find: /^@dietdev\/dom\/jsx-dev-runtime$/, replacement: path("src/jsx-dev-runtime.ts") },
      { find: /^@dietdev\/dom\/jsx-runtime$/, replacement: path("src/jsx-runtime.ts") },
      { find: /^@dietdev\/dom$/, replacement: path("src/index.ts") },
    ],
  },
  build: {
    outDir: "../dist-demo",
    emptyOutDir: true,
  },
});
