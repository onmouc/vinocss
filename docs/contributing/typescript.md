# TypeScript

Style rules for TypeScript files, on top of the general code rules.
Read when writing or editing TypeScript.
The shared rules in [code](./code.md) still apply alongside these.

## Types

1. Prefer `type` over `interface` when both can express the shape.
2. Keep `interface` for the cases that need it, such as declaration merging.
3. Reach for a type alias for unions, tuples, and function types.
