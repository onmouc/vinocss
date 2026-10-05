# @vinocss/utils-decorate

This package wraps a text in ansi sgr escape sequences to decorate terminal output.
A log line often needs a color or a style, and the raw codes are easy to mistype,
so one class composes them and one call decorates a string.
It is published for anyone to use, so a project can color a line the same way.

## Surface

1. `Decorator` holds the text and the sgr parameters a call gathers.
2. `decorate(text)` is the shorthand for `new Decorator(text)`.
3. Each style and color method returns a new `Decorator`, so the calls chain.
4. `code(...params)` adds a raw sgr parameter, and `reset()` drops every one.
5. `toString()` renders the text with one sgr sequence and one reset.
6. `fg256` and `bg256` take a 256-code color, and `rgb` and `bgRgb` take an rgb one.

## Structure

1. A rendered decorator is `esc [ params m text esc [ 0 m`, the ansi sgr form.
2. Chained calls join their parameters with `;`, so `bold` then `red` writes
   `esc [ 1 ; 31 m` around the text.
3. An empty parameter list renders the text plain, with no escape at all.

## Styles

1. A style method takes its ansi name, such as `bold`, `faint`, `italic`,
   `underline`, `blink`, `reverse`, `conceal`, or `crossedOut`.
2. `dim` aliases `faint`, `invert` aliases `reverse`, `hidden` aliases `conceal`,
   and `strikethrough` aliases `crossedOut`.
3. A code with no named method reaches the raw `code(...params)` call.

## Colors

1. A foreground method is `black`, `red`, `green`, `yellow`, `blue`, `magenta`,
   `cyan`, or `white`.
2. A bright one adds a `bright` prefix, such as `brightRed`, and `gray` aliases `brightBlack`.
3. A background method adds a `bg` prefix, such as `bgRed` or `bgBrightRed`.
4. `fg256(code)` and `bg256(code)` take a 256-code color from `0` to `255`.
5. `rgb(r, g, b)` and `bgRgb(r, g, b)` take three channels from `0` to `255`.

## Usage

1. Install it as a dependency, for example `pnpm add @vinocss/utils-decorate`.
2. Call `decorate(text)`, chain a style or a color, and render the result.

```ts
import { decorate } from "@vinocss/utils-decorate"

const label = decorate("ready").bold().green()
console.log(String(label)) // a bold green "ready"
```
