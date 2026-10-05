import { defineConfig } from "vite"
import solid from "vite-plugin-solid"

export default defineConfig({
  tsconfig: "jsconfig.json",
  plugins: [solid()],
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    outDir: "out",
  },
})
