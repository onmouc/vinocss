/**
 * A css custom property name, or a record of them, as `var$` resolves it.
 *
 * A leaf is a full name such as `--ink` or a minted `--a1b2c3`, while a record
 * keeps the keys the author declared so a member read such as `theme.ink`
 * still resolves to the matching leaf.
 */
export interface VarTree {
  leaf?: string
  props?: Map<string, VarTree>
}

/**
 * A value a static expression resolves to before it becomes css or code.
 */
export type Value =
  | { t: "lit"; v: string | number | boolean | null | undefined }
  | { t: "var"; tree: VarTree }
  | { t: "array"; items: Value[] }
  | { t: "object"; props: Map<string, Value> }
  | { t: "namespace"; id: string }

/**
 * The file reads a compiler needs to follow imports during analysis.
 *
 * `read` returns a module source or undefined, and `resolve` returns the file
 * a specifier points at, relative to the importing module, or undefined.
 */
export interface Host {
  read(id: string): string | undefined
  resolve(specifier: string, importer: string): string | undefined
}

/**
 * Read a value in string position, such as a template part or a computed key.
 *
 * A literal becomes its text, and a `var$` leaf becomes the custom property
 * name, which is what a computed style key needs. Anything else is not static.
 */
export function stringOf(value: Value): string {
  if (value.t === "lit") {
    if (value.v === null || value.v === undefined) return ""
    return String(value.v)
  }
  if (value.t === "var" && value.tree.leaf !== undefined) return value.tree.leaf
  throw new Error("vinocss: expected a static string")
}
