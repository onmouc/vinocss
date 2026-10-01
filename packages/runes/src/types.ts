import type * as CSS from "csstype"

/**
 * The value `var$` accepts and returns.
 *
 * A leaf is a css variable name, not a css value nor an expression.
 * An empty string asks the compiler to mint a unique name for the variable,
 * and a non-empty string names a variable the author declares.
 * The object form groups several names under one binding,
 * and every leaf resolves on its own, so the shape may nest as far as it needs.
 */
export type VarInput = string | { readonly [key: string]: VarInput }

/**
 * The result of `var$`: the input shape with every leaf resolved to a string.
 *
 * A leaf is a custom property name at runtime, such as `--brand-accent`
 * or a minted `--a1b2c3`, so the resolved type is a plain string.
 */
export type VarResult<T> = T extends string ? string : { readonly [K in keyof T]: VarResult<T[K]> }

/**
 * A static css value a style object accepts.
 *
 * It is a string or a number literal, or a reference produced by `var$`.
 * The compiler rejects any other expression, such as a plain variable or a call.
 */
export type StyleValue = string | number

/**
 * One css declaration value, or an ordered list of fallbacks for it.
 *
 * The compiler emits the list in order, so an earlier entry is the fallback
 * and the last entry is the preferred value.
 * The list lets a modern value land behind an older one,
 * such as a `light-dark()` color after a plain color.
 */
export type StyleProperty = StyleValue | readonly StyleValue[]

/**
 * A css style object, the parameter of `class$` and of a `style$` rule.
 *
 * It carries three kinds of entry:
 *
 * 1. A css property maps to a value or a fallback list, such as `color`.
 * 2. A nested selector maps to another style object, such as `:hover`.
 * 3. An at-rule maps to another style object, such as `@media (width < 40rem)`.
 *
 * A value is a static literal or a `var$` reference,
 * and the compiler rejects any other expression with an error.
 */
export type Style = {
  [P in keyof CSS.Properties]?: StyleProperty
} & {
  [key: string]: StyleProperty | Style | undefined
}

/**
 * A map of selector to style, the parameter of `style$`.
 *
 * Each key is a selector literal, such as `:root` or `body`,
 * and each value is a style object with the same rules as `class$`.
 * A computed or non-literal selector is rejected at compile time.
 */
export type GlobalStyle = { readonly [selector: string]: Style }
