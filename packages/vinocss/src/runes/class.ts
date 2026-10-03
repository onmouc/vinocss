import type * as CSS from "csstype"
import { uncompiled } from "@/runes/runtime"

/**
 * Compile a style object into a css class.
 *
 * The argument is a style object, and the call returns the class name string.
 * The compiler emits the rule as css, adds an import for that css to the file,
 * and replaces the call with the generated class name.
 * The name can sit in a `class` or `className` expression,
 * or start a `const` that is used later.
 *
 * The object mixes three kinds of entry, all on the same value rules:
 *
 * 1. A css property maps to a literal or a `var$` reference.
 * 2. A property may hold a fallback list the compiler emits in order.
 * 3. A nested selector or at-rule, such as `:hover` or `@media`, holds a style object.
 *
 * A value must be a static literal or a `var$` reference;
 * any other expression, such as a plain variable or a call, is a compile-time error.
 * Before compilation the call throws in its place.
 */
export function class$(styles: Style): string {
  return uncompiled("class$", styles)
}

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
