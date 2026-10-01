import { svelte } from "@sveltejs/vite-plugin-svelte"
import { defineConfig } from "vite"

export default defineConfig({
  tsconfig: "jsconfig.json",
  plugins: [svelte()],
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    outDir: "out",
  },
})
