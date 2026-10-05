# @vinocss/utils-log

This package formats a console line and keeps the time of the last line.
A command often needs a level, a timestamp, and the cost of a step,
and the raw escape codes and the date parts are easy to get wrong,
so one `Logger` renders the whole line from a small set of options.
It is published for anyone to use, so a project can log in the same shape.

## Surface

1. `Logger` owns the fields every line carries and the sink the line reaches.
2. `log` is a shared default instance, so a caller logs without building one.
3. `debug`, `info`, `done`, `warn`, and `error` write one line at that level.
4. A call may pass `details`, which lands dim on the next line.
5. `elapsed` reads the milliseconds since the previous call.
6. `levelMarkers` maps each level to its short marker.
7. `close()` releases a file sink, though the process closes it on exit anyway.

## Line

A line joins the parts a caller enabled with a single space:

1. `name` prefixes the line, and an empty name is left out.
2. The level marker is `[>]`, `[i]`, `[v]`, `[!]`, or `[x]`.
3. The timestamp follows the parts chosen in `time`.
4. The message is the argument, and the time cost trails as `+12ms`.

The level owns the color: `debug` is dim, `info` blue, `done` green,
`warn` yellow, and `error` red. Color is on for a terminal and off for a file.

## Time

The `time` option is `true` for the full form, or a `TimeFormat` of parts:
`year`, `monthDate`, `weekday`, `time`, `second`, and `millis`.
A part is enabled on its own, and `time` is the master switch for the clock.

The full form is `2013.04.15(6) 12:34:05.678`.

## Sink

1. Without an option a line reaches the standard output.
2. `file` appends the lines to a file instead.
3. `sink` takes a custom writer, and it wins over `file`.
4. `delta` appends the milliseconds since the previous call.

## Usage

1. Install it as a dependency, for example `pnpm add @vinocss/utils-log`.
2. Build a `Logger` with the name, the time, and the sink the command needs.

```ts
import { Logger } from "@vinocss/utils-log"

const log = new Logger({ name: "app", time: true, delta: true })
log.info("ready", "listening on 3000")
```

The logger source lives in [`@vinocss/devtools-build`](../devtools-build/README.md),
and this package builds it in, so a caller reaches the logger from one small name
without the build engine on the runtime graph; the
[re-export guide](../../docs/contributing/reexport.md) states the rule.
