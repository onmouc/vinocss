# Review

How to check a change before it is committed.
Read when code changed and the work is ready to check.

## Inspect

1. Read the real changes first, such as with `git status` and `git diff`.
2. Skip lockfiles such as `pnpm-lock.yaml`, whose diff wastes tokens.
3. Treat the whole tree as the change, not only the latest edit.

## Gate

1. Run `pnpm review` from the root when source code changed.
2. When only docs changed, run `pnpm fmt:check`; it is enough and faster.
3. The full gate checks format, lint, line width, types, build, and tests for every package.
4. Lint treats warnings as failures, so fix every finding.
5. Format with `pnpm fmt`, then re-run the same gate until it passes.
6. Once it passes, the change is ready to describe; write the message with [commit](./commit.md).

A passing gate is the default signal that a change is safe to describe,
and a message is due right after it passes.
Until it passes, fix the tree instead of writing a message.

## Leftovers

1. A scratch script, a probe, or a sample folder is fine while you work.
2. Remove each one before the review, so the gate sees only the real change.
3. Leave build output alone; it is ignored and rebuilt on every build.
