import type { Style } from "@/runes/class"
import { uncompiled } from "@/runes/runtime"

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
 * A map of selector to style, the parameter of `style$`.
 *
 * Each key is a selector literal, such as `:root` or `body`,
 * and each value is a style object with the same rules as `class$`.
 * A computed or non-literal selector is rejected at compile time.
 */
export type GlobalStyle = { readonly [selector: string]: Style }
