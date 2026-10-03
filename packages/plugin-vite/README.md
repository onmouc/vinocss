# @vinocss/plugin-vite

The Vite plugin that compiles VinoCSS source.

It reads every `var$`, `class$`, and `style$` call in a module,
resolves the names and styles they describe at build time,
and rewrites each call into the plain value it stands for.
A `var$` call becomes the custom property names it declares,
and a `class$` call becomes one hashed class name,
with its rule emitted into a virtual css module the file then imports.
A `style$` call becomes nothing, with its global rules emitted into the same
virtual css module. The runtime sees no VinoCSS call, so the bundle carries only the css it uses.

## Usage

1. Install it as a dev dependency, for example `pnpm add -D @vinocss/plugin-vite`.
2. Add `vinocss()` to the `plugins` array of the Vite config.
3. Keep `vinocss` imported from the package root.

```ts
import { defineConfig } from "vite"
import { vinocss } from "@vinocss/plugin-vite"

export default defineConfig({
  plugins: [vinocss()],
})
```

## Static values

1. A `var$` argument resolves to a name string and prefixes it with `--`.
2. A null leaf mints a stable hashed name, and an empty string is an error.
3. A `class$` value is a literal or a `var$` name, and nothing else.
4. A plain const or a template literal that reads only static consts resolves.
5. A const imported from another file resolves by analyzing that file first.
6. A value that would need to run first throws a compile-time error.
7. A reference cycle between consts is reported rather than followed.

A `var$` leaf is a custom property name such as `--ink`, not a `var()` reference.
To use it as a css value, wrap it, as in `color: v(theme.ink)` or a `var()` template;
a bare `color: theme.ink` compiles to the name `--ink`, which is meant for a key or a dom write.
The compiler caches a parsed program per module and a resolved value per const,
so a diamond import parses and resolves each file once.

## Classes

1. `class$` emits one rule per call and returns a hashed class name.
2. The rule joins the file's classes in one virtual css module.
3. The transformed file gains an import for that module.
4. A fallback list emits one declaration per value, in order.
5. A nested selector or at-rule nests under the generated class,
   with `&` standing for that class.

## Global styles

1. `style$` emits one rule per selector and returns nothing.
2. Its selectors and rules join the same virtual css module as the file's classes.
3. The selector key is a literal, such as `body` or `:root`; a computed key is an error.
4. Each value is a style object with the same rules as the `class$` argument.
5. A computed style property key, such as a `var$` leaf, still resolves inside the object.
6. The transformed file keeps the virtual css import when either a class or a rule exists.

## Status

1. `var$`, `class$`, and `style$` compile.
2. Styles are one class per call, with no atomic css or dedupe across files.
3. A framework file is skipped, so only plain TypeScript and JavaScript transform.
