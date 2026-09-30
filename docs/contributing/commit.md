# Commit

Commit message rules.
Contributors need the format; ai tools also follow the generation steps.
Read when a change is ready to describe.

## Format

1. Title: `keyword(scope): summary`, using a keyword below, lowercase, no trailing dot or `#`.
2. Write the title for the goal: what the change should do, or what should hold after it.
3. Keep the title short and concise; a brief paragraph below may expand it.
4. Add an ordered list for separate changes; three to nine items, each shaped like the title.
5. Keep the title and items within about 60 characters.
6. Write items terse; drop filler words such as add or the.
7. Write each paragraph on a single line; a commit message is not wrapped like a markdown file.

## Keywords

- `setup` - workspace, package, or tooling bootstrap
- `feat` - new feature
- `fix` - bug fix
- `perf` - performance improve
- `refactor` - change with no behavior change
- `style` - formatting only
- `test` - tests
- `docs` - documentation only
- `build` - build system or dependencies
- `chore` - routine upkeep
- `ci` - continuous integration
- `revert` - undo an earlier change

## Content

1. Let the title and items state the goal, not the mechanics.
2. Use the paragraphs below for why it was wanted and how it was done.
3. Keep each paragraph under the subtitle it belongs to.
4. Explain why, not what; the diff already shows what changed.
5. Describe intent and reasoning not recoverable from the files.
6. Infer the reason for edits the user made by hand.
7. Open with a short brief under the title and list, with no subtitle.
8. For more detail, name a `##` subtitle for its exact topic, not a bare category like Build.
9. Skip trivial editor changes, such as a new spelling word, unless they change shared behavior.

## Example

```text
fix(pkg): resolve alias on nested imports

1. fix(pkg): read paths from the app tsconfig
2. test(pkg): cover a nested alias import
3. docs(pkg): note how the alias resolves

... (paragraphs or even sections with subtitles)
```

## Generating (AI tools)

1. Run the review in [review](./review.md), and continue once it passes.
2. Generate the message, covering everything changed so far.
3. Include your edits and the user's manual edits since the last task.
4. Write to `.commit` at the workspace root, which git ignores.
5. Do not commit; the user reviews the diff and message, then commits.
