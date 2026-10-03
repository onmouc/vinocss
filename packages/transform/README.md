# @vinocss/transform

The VinoCSS compiler that turns a source module into plain JavaScript and css.

It reads every `var$`, `class$`, and `style$` call in a module,
resolves the names and styles they describe at build time,
and rewrites each call into the plain value it stands for.
A `var$` call becomes the custom property names it declares,
and a `class$` call becomes one hashed class name,
with its rule collected into the css the module frees.
A `style$` call becomes nothing, with its global rules collected into the same css.
The transformed module keeps no VinoCSS runtime, so a bundle carries only the css it uses.

The package holds the compiler and no bundler, so a plugin package wraps it for one tool.

## Surface

1. `Compiler` compiles a module.
   `compile(source, id)` returns the rewritten `code`, the `css` it freed,
   and the `virtualId` a caller resolves to load that css, or null when no rule exists.
2. `createNodeHost()` returns a `Host` that reads modules and follows imports on the filesystem.
3. `unitHelpers` is the set of `vinocss/utils` unit names the compiler reads.
4. `virtualCssPrefix` is the prefix of the virtual id, so a plugin recognizes the import.
5. `CompileResult` and `Host` describe the compile result and the file read a compiler needs.

A `Host` reads a module source and resolves a specifier to a file,
so a caller without a filesystem can supply its own.

## Usage

1. Install it, for example `pnpm add @vinocss/transform`.
2. Create one `Compiler` for a build, and call `compile` for each module.
3. Read [plugin-vite](../plugin-vite/README.md) and [plugin-rsbuild](../plugin-rsbuild/README.md)
   for the bundler wrappers around this surface.

```ts
import { Compiler, createNodeHost } from "@vinocss/transform"

const compiler = new Compiler(createNodeHost())
const { code, css, virtualId } = compiler.compile(source, id)
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
2. The rule joins the file's classes in one css body.
3. The transformed file gains an import for the virtual module that holds that body.
4. A fallback list emits one declaration per value, in order.
5. A nested selector or at-rule nests under the generated class,
   with `&` standing for that class.

## Global styles

1. `style$` emits one rule per selector and returns nothing.
2. Its selectors and rules join the same css body as the file's classes.
3. The selector key is a literal, such as `body` or `:root`; a computed key is an error.
4. Each value is a style object with the same rules as the `class$` argument.
5. A computed style property key, such as a `var$` leaf, still resolves inside the object.
6. The transformed file keeps the virtual css import when either a class or a rule exists.

## Status

1. `var$`, `class$`, and `style$` compile.
2. Styles are one class per call, with no atomic css or dedupe across files.
3. A framework file is skipped, so only plain TypeScript and JavaScript transform.
