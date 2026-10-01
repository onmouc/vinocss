# VinoCSS

A variable integrated nano css framework.

VinoCSS styles an app from the code that uses it.
You declare css variables with `var$`, build class names with `class$`,
and register global rules with `style$`.
A compiler rewrites each call into plain css at build time,
so the shipped bundle carries no runtime and only the css it needs.

Today the compiler is not implemented, so every call throws.
The api below is the contract the compiler will honor,
and the examples under `examples/` show how each call is written.

## Usage

1. Declare the variables a component needs with `var$`.
2. Describe the component styles with `class$`, and read the class name it returns.
3. Register page-wide rules with `style$`.
4. Let the compiler emit the css and import it into the file.

```ts
import { class$, style$, var$ } from "vinocss"

const theme = var$({ surface: "", ink: "" })

const card = class$({
  padding: "1.5rem",
  color: theme.ink,
  background: theme.surface,
  borderRadius: "0.75rem",
  boxShadow: ["0 1px 3px rgb(0 0 0 / 0.2)", "0 4px 12px rgb(0 0 0 / 0.15)"],
  ":hover": { boxShadow: "0 6px 20px rgb(0 0 0 / 0.25)" },
})

style$({
  ":root": { [theme.surface]: "#ffffff", [theme.ink]: "#18181b" },
  body: { margin: "0", fontFamily: "system-ui, sans-serif" },
})
```

## Variables

### `var$`

`var$` declares or references a css custom property.

1. The argument is a name string or a record of name strings.
2. The return keeps the same shape, with every leaf resolved to a name.
3. An empty string mints a unique name and prefixes it with `--`.
4. A non-empty string takes a `--` prefix and is used as written.
5. An object resolves each leaf on its own and keeps the declared keys.

Because the compiler rewrites the call, `var$` may only start a `const`.
Every argument must be a static literal,
so a reused variable, a computed name, or another call is a compile-time error.
Before compilation the call throws in its place.

```ts
const theme = var$({ surface: "", ink: "" })
const accent = var$("brand-accent")
```

## Classes

### `class$`

`class$` compiles a style object into a css class.

1. The argument is a style object, and the call returns a class name string.
2. The compiler emits the rule as css and adds an import for it to the file.
3. The name may sit in a `class` or `className` expression.
4. The name may also start a `const` that is used later, as `var$` does.
5. Every value is a static literal or a `var$` reference, and nothing else.

A property may hold a fallback list, which the compiler emits in order.
The earlier entries are fallbacks and the last entry is the preferred value,
so a `light-dark()` color can follow a plain color.

A nested selector or at-rule holds another style object.
A key that starts with `&`, `:`, or `::` is a nested selector,
and a key that starts with `@` is an at-rule, such as `@media`.
The compiler nests the inner style under that selector or at-rule.

```ts
const button = class$({
  color: "white",
  background: ["#2563eb", "oklch(0.6 0.2 264)"],
  ":hover": { background: "#1d4ed8" },
  "@media (prefers-reduced-motion: reduce)": { transition: "none" },
})
```

## Global styles

### `style$`

`style$` registers global css rules.

1. The argument maps a selector literal to a style object.
2. Each value follows the same rules as the `class$` argument.
3. The compiler emits the rules and removes the call.
4. The call returns nothing, so it runs once at module scope.

A selector must be a static literal, and a value must be a static literal
or a `var$` reference; any other expression is a compile-time error.
Before compilation the call throws in its place.

```ts
style$({
  ":root": { [theme.surface]: "#ffffff", [theme.ink]: "#18181b" },
  body: { margin: "0" },
})
```

## Compile time

1. A call to `var$`, `class$`, or `style$` is a placeholder until the compiler runs.
2. The compiler replaces the call, so the runtime never sees it.
3. A call that reaches the runtime throws, which means the compiler was not wired up.
4. A rule the compiler cannot honor, such as a non-literal value, is a build error.
