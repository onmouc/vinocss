import vue from "@vitejs/plugin-vue"
import { defineConfig } from "vite"

export default defineConfig({
  tsconfig: "jsconfig.json",
  plugins: [vue()],
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    outDir: "out",
  },
})
