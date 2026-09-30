# Comments

How to write comment docs, the docs attached to code.
Read when adding or editing a comment doc.

## When

1. Add a comment doc to an exported API, to introduce it and guide its use.
2. Omit it when the name states the feature and the API is genuinely simple.
3. Write no comment doc for non-public code by default.
4. Add one there only when the code is really hard to follow.
5. Do not restate what the code already shows; a redundant comment wastes tokens.

## Format

1. Open with a single-line title that gives the brief intro.
2. Follow it with paragraphs that carry the explanation.
3. Use an ordered list when the detail is structural.
4. Use the language's comment-doc syntax, such as `/** */` in TypeScript.
5. Keep the body as prose or a list, not a tag block.
6. Break lines as a markdown file does, at clause boundaries.

## Audience

1. A public comment doc speaks to users who call the API.
2. Include the principle behind it, so a user can apply it in different situations.
3. A private comment doc speaks to developers who already read the source.
4. Inline comments can also help developers inside a public API.

Comment docs are a help, not a transcript.
A reader and an AI tool both read the code,
so a comment earns its place only when it adds what the code cannot.
