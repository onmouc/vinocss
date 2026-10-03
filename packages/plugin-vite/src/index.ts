import type { Plugin } from "vite"
import { Compiler } from "@/compiler"
import { createNodeHost } from "@/host"

const virtualPrefix = "virtual:vinocss/"
const nullByte = "\0"
const target = /\.(?:[cm]?[jt]sx?)$/u

/**
 * Create the VinoCSS Vite plugin.
 *
 * The plugin resolves a `var$` call to the custom property names it declares
 * and a `class$` call to a hashed class name, freeing css into one virtual
 * module per source file. The source gains an import for that module, so the
 * bundler owns the css while the module keeps no VinoCSS runtime.
 *
 * One compiler instance backs the plugin, so a module is parsed once and an
 * imported const is resolved once across the whole build.
 */
export function vinocss(): Plugin {
  const compiler = new Compiler(createNodeHost())
  return {
    name: "@vinocss/plugin-vite",
    resolveId(id) {
      if (id.startsWith(virtualPrefix) && id.endsWith(".css")) return `${nullByte}${id}`
      return null
    },
    load(id) {
      if (!id.startsWith(`${nullByte}${virtualPrefix}`)) return null
      return compiler.readCss(id.slice(nullByte.length))
    },
    transform(source, id) {
      const file = id.split("?")[0]
      if (!target.test(file)) return null
      const result = compiler.compile(source, file)
      if (result.code === source) return null
      return { code: result.code, map: null }
    },
  }
}
