# Guidelines

Structure and maintenance rules for the guide system itself.
Read only when adding or reshaping guides, not for ordinary tasks.

## Layout

1. `docs/` is the documentation set, and a future site renders only that folder.
2. Files outside `docs/`, such as `README.md` and `CONTRIBUTING.md`, serve the source repo.
3. `AGENTS.md` and `CONTRIBUTING.md` are the outer entries, one per audience.
4. `docs/contributing.md` is the contributor entry inside the docs set, and it greets a reader.
5. `docs/contributing/index.md` maps the guides a task can start from and their conditions.
6. Guides live in `docs/contributing/`, one topic per file, named with one short word.

`CONTRIBUTING.md` and `docs/contributing.md` may read more warmly than the rest,
since they greet human contributors.
`AGENTS.md` stays a bootstrap only; subject rules, including conduct, live in the routed guides.

## Links

1. An outer entry uses a root-relative path, such as `docs/contributing.md`.
2. A docs page uses a relative markdown link, such as [commit](./commit.md).
3. `index.md` routes only the guides a task can start from.
4. A deeper guide hangs off the guide that reaches it, with its trigger condition.

## Rules

1. Add a shared rule as its own `docs/contributing/<name>.md`.
2. Read each file on demand, and keep it to one topic.
3. Keep meta rules out of files that always load, the entries and `index.md`;
   put an always-on behavior in the `## Defaults` list of `AGENTS.md` instead.
4. Route a new guide from `index.md` when a task can start with it;
   otherwise link it from the guide that reaches it, with its trigger condition.
5. Keep `index.md` a short map, and let a guide link the narrower guides it needs.
6. Put an audience-specific link in that audience's entry file only.
