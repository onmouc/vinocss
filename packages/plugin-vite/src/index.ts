import type { Plugin } from "vite"

/**
 * Transform a VinoCSS source file.
 *
 * The placeholder returns the source unchanged, so a later compiler can take
 * this spot without moving the plugin entry.
 */
export function transform(source: string): string {
  return source
}

/**
 * Create the VinoCSS Vite plugin.
 *
 * The plugin is a placeholder. It claims the transform of every module and
 * returns the source unchanged, so an app can wire it into a Vite config now
 * and the compiler can replace the transform later.
 */
export function vinocss(): Plugin {
  return {
    name: "@vinocss/plugin-vite",
    transform(source) {
      return { code: transform(source), map: null }
    },
  }
}
