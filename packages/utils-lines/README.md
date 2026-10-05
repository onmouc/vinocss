# @vinocss/utils-lines

This package joins source parts into one string, one part per line.
A multi-line snippet is common in a test fixture or an expected output,
and writing it as one escaped string hides the shape the snippet should keep.
It is published for anyone to use, so any project can build such a snippet the same way.

## Surface

1. `lines(...parts)` joins the parts with a newline, so each part is one source line.
2. A part may itself hold a newline, which is kept as written rather than re-split.
3. No trailing newline is added, so the result matches a file that ends on its last line.

## Usage

1. Install it as a dev dependency, for example `pnpm add -D @vinocss/utils-lines`.
2. Pass one argument per source line, and the result is the file text.
3. Reach for it wherever a readable multi-line string helps, such as a fixture.

```ts
import { lines } from "@vinocss/utils-lines"

const source = lines("const a = 1", "const b = 2")
```
