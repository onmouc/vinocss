# Contributing

This package is a redirect, not the source of its code.
It points at [`@vinocss/devtools-build`](../devtools-build),
and `src/index.ts` is one line that re-exports its `./log` subpath,
so the logger and its tests live in that package.

The build tool is a dev dependency, never a runtime one.
The build bundles the subpath into `out`,
so the logger ships under this short name without the build engine on the runtime graph.
The [re-export guide](../../docs/contributing/reexport.md) states the rule,
so change the read in the build package rather than here.
