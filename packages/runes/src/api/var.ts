import { uncompiled } from "@/runtime"

/**
 * Declare or reference a css custom property.
 *
 * The argument is a name string, null, or a record of them,
 * and the return keeps that same value type, so a string resolves to a string
 * and an object keeps its keys with every leaf resolved to a string.
 * The compiler replaces the call with the resolved names:
 *
 * 1. A null mints a unique hashed name and prefixes it with `--`.
 * 2. A non-empty string takes a `--` prefix and is used as written.
 * 3. An empty string is an error, since a variable name cannot be empty.
 * 4. An object resolves each leaf the same way and keeps the declared keys.
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
 * The value `var$` accepts and returns.
 *
 * A leaf is a css variable name, not a css value nor an expression.
 * A null asks the compiler to mint a unique hashed name for the variable,
 * a non-empty string names a variable the author declares,
 * and an empty string is rejected as a compile-time error.
 * The object form groups several names under one binding,
 * and every leaf resolves on its own, so the shape may nest as far as it needs.
 */
export type VarInput = string | null | { readonly [key: string]: VarInput }

/**
 * The result of `var$`: the input shape with every leaf resolved to a string.
 *
 * A leaf is a custom property name at runtime, such as `--brand-accent`
 * or a minted `--a1b2c3`, so a null leaf and a string leaf both resolve to a string.
 */
export type VarResult<T> = T extends string | null
  ? string
  : { readonly [K in keyof T]: VarResult<T[K]> }
