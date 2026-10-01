# TypeScript

Style rules for TypeScript files, on top of the general code rules.
Read when writing or editing TypeScript.
The shared rules in [code](./code.md) still apply alongside these.

## Imports

1. A child package resolves its own modules through the `@/*` alias, such as `@/types`.
2. Prefer the alias over a relative path, so a moved file keeps its imports intact.
3. The alias covers a value import, a `import type`, and a re-export, so one form fits all.
4. Keep an external module as its package name, such as `csstype` or `@vinocss/runes`.

## Types

1. Prefer `type` over `interface` when both can express the shape.
2. Keep `interface` for the cases that need it, such as declaration merging.
3. Reach for a type alias for unions, tuples, and function types.

## Exports

1. Re-export a whole module with `export *`, so the public surface stays one line.
2. List a name only when the surface is a deliberate subset of its module.
3. Use `export type *` for a module that holds only types.
4. Avoid a name two re-exported modules share, since `export *` collides on it.
