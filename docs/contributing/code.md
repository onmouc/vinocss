# Code

Style rules for code files, including config.
Read when writing or editing code.

## Separators

1. Group related lines, and keep each group short.
2. Break groups with an empty comment, such as `//`.
3. Prefer it over a blank line when the groups still belong together.
4. Keep the comment empty, with no label that repeats the code.
5. Use it where a formatter would otherwise pack the lines tight.
6. Leave a short block as one group, and break it only once it grows long.

An empty comment marks a soft break without a heading or filler word.
It lets a long block read as one unit while still showing where a new concern starts.

## Spacing

1. Avoid an unnecessary empty line, especially around a single line of code.
2. Do not leave a lone line sitting between two blank lines.
3. Keep a blank line only at a real boundary, such as after the imports.
4. Add a blank line inside a function only when the function is long enough to need it.

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
