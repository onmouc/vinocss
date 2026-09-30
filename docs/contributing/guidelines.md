# Guidelines

Structure and maintenance rules for the guide system itself.
Read only when adding or reshaping guides, not for ordinary tasks.

## Layout

1. `AGENTS.md` and `CONTRIBUTING.md` are the entries, one per audience.
2. `README.md` is for users rather than contributors.
3. `docs/contributing/index.md` maps the shared guides and their conditions.
4. Guides live in `docs/contributing/`, one topic per file, named with one short word.

`CONTRIBUTING.md` may read more warmly than the other files, since it greets human contributors.
`AGENTS.md` stays a bootstrap only; subject rules, including conduct, live in the routed guides.

## Links

1. An entry uses root-relative paths, such as `docs/contributing/commit.md`.
2. Any other guide uses a markdown link, such as [commit](./commit.md).
3. A shared route goes in `index.md`; an audience-specific link goes in its entry.

## Rules

1. Add a shared rule as its own `docs/contributing/<name>.md`.
2. Read each file on demand, and keep it to one topic.
3. Keep meta rules out of files that always load, the entries and `index.md`.
4. Add a new guide's route to `index.md`, with its trigger condition.
5. Put an audience-specific link in that audience's entry file only.
