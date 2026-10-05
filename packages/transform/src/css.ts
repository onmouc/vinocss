import { cased } from "@vinocss/utils-case"

/**
 * A stable short hash of a css body, used for a minted name or a class name.
 *
 * The hash is content-based, so a repeated declaration block reuses one class,
 * and it stays the same across builds so a shipped bundle keeps its names.
 */
export function contentHash(text: string): string {
  let hash = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    hash ^= text.codePointAt(i) ?? 0
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(36)
}

/**
 * Turn a style key into a css property name.
 *
 * A custom property already starts with `--` and is kept as written. A camel
 * cased key is split into its words and rejoined in kebab case, and a leading
 * vendor prefix gains its dash, so `borderRadius` reads as `border-radius`
 * and `msFlex` as `-ms-flex`.
 */
export function kebabCase(property: string): string {
  if (property.startsWith("--")) return property
  const kebab = cased(property).kebab()
  return /^[A-Z]/u.test(property) ? `-${kebab}` : kebab.replace(/^ms-/u, "-ms-")
}
