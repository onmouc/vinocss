import type { Plugin } from "vite"
import { Compiler, createNodeHost, virtualCssPrefix } from "@vinocss/transform"

const nullByte = "\0"
const target = /\.(?:[cm]?[jt]sx?)$/u

/**
 * Create the VinoCSS Vite plugin.
 *
 * The plugin is the Vite side of the compiler: it transforms a matching module
 * with the shared compiler, exposes the css a transform freed under a virtual
 * module, and lets Vite own the rest. One compiler instance backs the plugin,
 * so a module is parsed once and an imported const is resolved once per build.
 */
export function vinocss(): Plugin {
  const compiler = new Compiler(createNodeHost())
  return {
    name: "@vinocss/plugin-vite",
    resolveId(id) {
      if (id.startsWith(virtualCssPrefix) && id.endsWith(".css")) return `${nullByte}${id}`
      return null
    },
    load(id) {
      if (!id.startsWith(`${nullByte}${virtualCssPrefix}`)) return null
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
