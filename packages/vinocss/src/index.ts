import type * as CSS from "csstype"

/**
 * Declare or reference a css custom property.
 *
 * The argument is a name string or a record of name strings,
 * and the return keeps that same value type, so a string resolves to a string
 * and an object keeps its keys with every leaf resolved to a string.
 * The compiler replaces the call with the resolved names:
 *
 * 1. An empty string mints a unique name and prefixes it with `--`.
 * 2. A non-empty string takes a `--` prefix and is used as written.
 * 3. An object resolves each leaf the same way and keeps the declared keys.
 *
 * Because the compiler rewrites the call, `var$` may only start a `const`.
 * Every argument must be a static literal, so a reused variable,
 * a computed name, or any other call is an error at compile time.
 * Before compilation the call throws in its place.
 */
export function var$<T extends VarInput>(value: T): VarResult<T> {
  return uncompiled("var$", value)
}

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
 * Register global css rules.
 *
 * The argument maps a selector literal to a style object,
 * such as `:root` or `body`, and each value follows the same rules as `class$`.
 * The compiler emits the rules and removes the call,
 * so `style$` returns nothing and runs once at module scope.
 *
 * A value must be a static literal or a `var$` reference;
 * any other expression, and any non-literal selector, is a compile-time error.
 * Before compilation the call throws in its place.
 */
export function style$(styles: GlobalStyle): void {
  uncompiled("style$", styles)
}

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

/**
 * Report a VinoCSS call that ran before the compiler could replace it.
 *
 * Every public function is a compile-time placeholder:
 * the compiler rewrites the call into plain css and drops the function.
 * A call that reaches the runtime therefore means the compiler never ran,
 * which is an error the caller must fix in the build.
 */
function uncompiled(api: string, value: unknown): never {
  const kind = typeof value === "object" ? "an object" : `a ${typeof value}`
  throw new Error(
    `vinocss: ${api}() ran without the compiler and received ${kind}; ` +
      "add the vinocss compiler to the build",
  )
}
