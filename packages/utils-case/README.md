# @vinocss/utils-case

This package splits a name into words and rebuilds it in a common case.
A style key, an identifier, or a file name often mixes conventions,
and one shared split lets a caller reach any case from the same words.
It is published for anyone to use, so a project can name a value the same way.

## Surface

1. `CaseConvert` splits a name in its constructor and exposes the result as `words`.
2. It builds `camel`, `pascal`, `kebab`, `snake`, `constant`, `dot`, `space`, and `title`.
3. `splitWords(value)` returns the words on their own.
4. `cased(value)` is the shorthand for `new CaseConvert(value)`.

## Split

1. A non-alphanumeric character is dropped and separates the words around it.
2. The split starts on the first letter, so a leading digit is dropped.
3. A lower case letter before an upper case one ends a word, so `borderRadius` splits.
4. An upper case run before a lower case letter ends before its last capital,
   so `HTTPServer` splits into `HTTP` and `Server`.
5. A run of upper case letters stays one word, so `HTTP` is left whole.
6. A digit is a word apart from a letter, and a digit run stays one word.

## Usage

1. Install it as a dependency, for example `pnpm add @vinocss/utils-case`.
2. Call `cased(name)` to split once and read any case.

```ts
import { cased } from "@vinocss/utils-case"

cased("HTTPServer-error").kebab() // "http-server-error"
```
