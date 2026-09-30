# Editor

VSCode is the recommended editor for this workspace.
Read when adding or changing shared editor configuration.

## Config

1. Keep shared configuration in `.vscode/`, so it travels with the repository.
2. Recommend only extensions the whole workspace depends on.
3. Keep settings to the essentials: encoding, line endings, indentation, ruler, spelling.

## Other editors

Local settings from other editors stay out of the repository, and `.gitignore` keeps them out.
VSCode is the one editor the workspace maintains, so shared settings have a single home,
and a contributor who prefers another tool keeps it to themselves.

## AI tools

1. Do not update editor settings as part of an ordinary task.
2. Touch them only to fix something improper or in conflict with the current change.
3. Assume the user made most settings edits, and include them in the commit message when relevant.
