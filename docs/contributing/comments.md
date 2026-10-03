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
3. Follow [markdown](./markdown.md) for the body, so a heading and a list
   read the same here as in a guide.
4. Use the language's comment-doc syntax, such as `/** */` in TypeScript.
5. Keep the body as prose or a list, not a tag block.
6. Give a section that must stand out, such as a thrown error, its own `##` heading.

## Audience

1. A public comment doc speaks to users who call the API.
2. Include the principle behind it, so a user can apply it in different situations.
3. A private comment doc speaks to developers who already read the source.
4. Inline comments can also help developers inside a public API.

## Errors

1. Give a thrown error its own section, headed `## Throws`, so a caller meets
   the contract before the body prose.
2. List each throw as its own item, and name the input that triggers it.
3. Give the boundary value, such as a maximum length or count,
   so a caller can avoid the error without reading the source.
4. Carry a limit the code enforces into the doc,
   since a constant the code keeps private is invisible to a caller.
5. State a miss too, such as an `undefined` return; a plain return stays in prose.

Comment docs are a help, not a transcript.
A reader and an AI tool both read the code,
so a comment earns its place only when it adds what the code cannot.
