# @vinocss/devtools-max-len

This package reports any tracked line that runs past a maximum width.
A long line is hard to read in a terminal, a diff, and a review,
so the workspace keeps every line within the limit and checks that before a commit.
It ships as the `vinocss-max-len` command, and it is published so any project can reuse it.

## Files

1. By default it checks every tracked file and every uncommitted file git does not ignore,
   read from `git ls-files`, so a new file is covered before its first commit.
2. It skips a lockfile, such as `pnpm-lock.yaml`, since a generated file is noise.
3. It skips a binary file, so a tracked image does not read as one endless line.
4. A positional argument is a git pathspec that limits the files, such as `src`.
5. `--ignore` adds pathspecs to exclude, and it takes a comma list and repeats.

## Width

1. `--max` sets the longest allowed line, and it defaults to 100 characters.
2. A line is measured in code points, so a character outside the basic plane counts once.
3. A carriage return is stripped with its newline, so a CRLF file measures like an LF one.
4. A violation prints `file:line:column`, where the column is the first character past the limit.

## Remedy

1. Shorten the line, such as by extracting a value or a helper.
2. Reflow prose at a clause boundary, so it reads as a paragraph.
3. Never break mid-clause only to reach the width; move the whole clause instead.

## Output

1. The library prints nothing, so the bin owns the console and the color.
2. `checkLineWidth` returns the violations, and it calls a `report` callback for each one.
3. The command lists every violation, then exits with a failing code when it found any.
4. A clean run prints one line and exits with a zero code.

## Usage

1. Install it as a dev dependency, for example `pnpm add -D @vinocss/devtools-max-len`.
2. Run `vinocss-max-len` to check every tracked file, or pass a pathspec to narrow it.
3. Pass `--max 80` to tighten the limit for a project with a narrower style.

```text
vinocss-max-len src --max 80
src/example.ts:12:81 line is 96, over 80
```
