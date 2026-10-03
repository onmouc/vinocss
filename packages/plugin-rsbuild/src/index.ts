import type { RsbuildPlugin } from "@rsbuild/core"
import { Compiler, createNodeHost, virtualCssPrefix } from "@vinocss/transform"

const target = /\.(?:[cm]?[jt]sx?)$/u

/**
 * Create the VinoCSS Rsbuild plugin.
 *
 * The plugin is the Rsbuild side of the compiler: it transforms a matching
 * module with the shared compiler, turns the css a transform freed into a
 * data module Rspack loads as css, and lets the bundler own the rest. One
 * compiler instance backs the plugin, so a module is parsed once and an
 * imported const is resolved once per build.
 */
export function vinocss(): RsbuildPlugin {
  const compiler = new Compiler(createNodeHost())
  return {
    name: "@vinocss/plugin-rsbuild",
    setup(api) {
      api.modifyRspackConfig((config) => {
        config.module.rules ??= []
        config.module.rules.push({ scheme: "data", mimetype: "text/css", type: "css" })
      })
      api.resolve(({ resolveData }) => {
        const request = resolveData.request
        if (!request.startsWith(virtualCssPrefix) || !request.endsWith(".css")) return
        resolveData.request = cssModule(compiler.readCss(request))
      })
      api.transform({ test: target, order: "pre" }, ({ code, resourcePath }) => {
        const result = compiler.compile(code, resourcePath)
        return result.code === code ? code : { code: result.code, map: null }
      })
    },
  }
}

/**
 * Write css as the data module Rspack reads as a stylesheet.
 */
function cssModule(css: string): string {
  return `data:text/css;charset=utf-8,${encodeURIComponent(css)}`
}
