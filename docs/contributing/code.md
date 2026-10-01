# Code

Style rules for code files, including config.
Read when writing or editing code.

## Spacing

1. Group related lines, and keep each group short.
2. Break groups with one blank line, and keep a short block as one group.
3. Avoid an unnecessary empty line, especially around a single line of code.
4. Keep a blank line at a real boundary, such as after the imports.
5. Do not leave a lone line sitting between two blank lines.
6. Add a blank line inside a function only when the function is long enough to need it.

A blank line carries the grouping, so related lines read as one block,
and a break marks a new concern.
One blank line is enough, since a second adds no meaning.

## Files

1. Keep related functions together, and let a file hold more than one.
2. Split a file when it grows large, or when a concern stands apart.
3. Avoid a file that holds only one small function.

## Order

1. Put the core point of a file as early as the code allows.
2. Let a reader meet the important part before its helpers.
3. Place a helper after the core; a function declaration is hoisted, so it still resolves.

## Blocks

1. Write a single-statement `if`, `else`, `for`, or `while` on one line.
2. Keep braces only when the body holds more than one statement.
3. Break the line only when the condition or the body grows too long to read.

## Entry

1. Put the top-level work of a bin entry in a `main` function.
2. Call `main` at the end.
3. Keep the shebang and the imports above it.

## Related

1. TypeScript files also follow [typescript](./typescript.md).
2. Comment docs also follow [comments](./comments.md).
3. A bin entry and the console output it prints also follow [log](./log.md).
4. Shared editor configuration also follows [editor](./editor.md).
