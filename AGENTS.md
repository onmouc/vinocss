# AGENTS

Entry point for ai tools in this workspace.
Loaded automatically, so it stays short and carries no subject rules of its own.

## Bootstrap

1. Start at `docs/contributing/index.md`, the map of guides and their conditions.
2. Read a guide only when its condition matches the current task.
3. Treat those guides as the source of truth for how to work here.

## Defaults

Behaviors that hold on every task unless the user cancels.

1. Generate or update the commit message before finishing any task;
   follow `docs/contributing/commit.md` and write it to `.commit`.
