# Commit

Commit message rules.
Contributors need the format; ai tools also follow the generation steps.
Read when a change is ready to describe.

## Format

1. Title: conventional commit style, lowercase, no trailing dot or `#`, e.g. `feat(x): xxx`.
2. Add an ordered list for separate changes; three to nine items, each shaped like the title.
3. Keep the title and items within about 60 characters.
4. Write items terse; drop filler words such as add or the.
5. Write each paragraph on a single line; a commit message is not wrapped like a markdown file.

## Content

1. Explain why, not what; the diff already shows what changed.
2. State what was wanted, then why it was done this way.
3. Describe intent and reasoning not recoverable from the files.
4. Infer the reason for edits the user made by hand.
5. Open with a short brief under the title and list, with no subtitle.
6. For more detail, add a `##` subtitle named for its topic; drop words like why.
7. Skip trivial editor changes, such as a new spelling word, unless they change shared behavior.

## Generating (AI tools)

1. When a task is done, prepare the message for everything changed so far.
2. Inspect the real changes first, such as with `git status` and `git diff`.
3. Include your edits and the user's manual edits since the last task.
4. Write to `.commit` at the workspace root, which git ignores.
5. Do not commit; the user reviews the diff and message, then commits.

A session may hold several tasks and the tree can change between them;
inspect it again before each message.
