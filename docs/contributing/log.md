# Log

How a package writes to the console, and the lint config that allows it.
Read when writing a bin entry or wiring the log it prints.

## Bin

1. A bin entry owns the console, so the log lives there and nowhere else.
2. Keep the library silent: return a value, or take a `reporter` and call it, but never print.
3. Give the bin one reporter, and let a caller invoke the callback it needs,
   such as `step`, `skip`, or `warn`.
4. Keep the reporter a plain object, so a caller can swap in a test double and assert the calls.
5. Add `chalk` as a package dependency when the log needs color, and import it in the bin only.
6. Color the prefix, not the whole line, so the message stays readable in a plain terminal.
7. Forward a dependency's own log through the reporter, such as a bundler's `onLog`,
   rather than let it print.

A library that prints cannot be reused or tested without capturing the console,
so the print waits for the bin and the reporter carries it down.

## Lint

1. `no-console` is an error across the workspace, since a stray print is easy to miss.
2. A root override turns it off for `**/src/main.ts`, the default bin name.
3. A package with another bin filename adds a `.oxlintrc.json` in its own folder.
4. A nested config replaces the root one for the files it covers, so extend the root first,
   as `"extends": ["../../.oxlintrc.json"]`, to keep every shared rule.
5. Then add an override for the bin path, such as `"files": ["bin/**"]`,
   and oxlint resolves the pattern against the config that declares it.

The root covers the common case, and a package with a second bin name carries its own small config.

```json
{
  "extends": ["../../.oxlintrc.json"],
  "overrides": [{ "files": ["bin/**"], "rules": { "no-console": "off" } }]
}
```
