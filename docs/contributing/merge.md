# Merge

Merging a branch into the current branch, and the message that describes it.
Contributors need the shape and the format; ai tools also follow the generation steps.
Read when a branch is ready to merge.

## Shape

1. Merge the named branch into the current branch, never the current into the named one.
2. Let the branch's commit count choose the shape.
3. Two or more commits: land the branch with a merge commit.
4. A single commit: rebase it onto the current branch instead.
5. A merge commit joins both histories; a rebase keeps the current line straight.

## Conflicts

1. Resolve every conflict before the merge is described; leave no marker behind.
2. Keep both sides' intent when the changes do not truly oppose.
3. Prefer the current branch when both sides express the same rule differently.
4. Stage each file once it is resolved.
5. A resolution that adds a real change belongs in the message below.

## Gate

1. Run `pnpm review` from the root once the merge is resolved.
2. Treat the merged tree as the change, and fix it until the gate passes.
3. Do not commit; leave the merge staged for the user.

## Message

1. Follow the commit format in [commit](./commit.md) for the title and paragraphs.
2. Write the title as a brief intro of the whole branch,
   in the same `keyword(scope): summary` shape.
3. A merge commit lists every commit title from the branch as an unordered list.
4. Keep the list unordered: branch commits are a set, not an ordered sequence.
5. A rebase merge reuses the single commit's message, unchanged.
6. When a conflict forced extra work, add a short note that explains the resolution.
7. Write each paragraph on a single line, as a commit message, not wrapped markdown.

## Example

A branch with more than one commit becomes a merge commit with an unordered list:

```text
feat(vinocss): merge the nested alias work

- feat(vinocss): read paths from the app tsconfig
- test(vinocss): cover a nested alias import
- docs(vinocss): note how the alias resolves

The branch ties alias resolution to the app tsconfig and covers it.
```

A branch with a single commit keeps that commit's message,
and only notes a conflict when one was resolved.

## Generating (AI tools)

1. Merge the branch into the current branch, and stop before the commit is recorded.
2. Resolve every conflict and stage the result.
3. Run the gate; continue only once it passes.
4. Generate the message and write it to `.commit` at the workspace root.
5. Do not commit; report the message and wait for the user to commit by hand.
