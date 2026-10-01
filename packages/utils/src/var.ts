/**
 * Reference a css custom property.
 *
 * The argument is a custom property name and the result is a `var()` reference,
 * so `v("--brand")` reads as `"var(--brand)"` and fits where a css value string is expected.
 */
export const v = <T extends string>(name: T): `var(${T})` => `var(${name})`
