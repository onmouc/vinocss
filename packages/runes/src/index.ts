import type { GlobalStyle, Style, VarInput, VarResult } from "@/types"

export type * from "@/types"

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
