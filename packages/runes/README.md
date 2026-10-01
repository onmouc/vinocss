# @vinocss/runes

The VinoCSS compiler runes: `var$`, `class$`, and `style$`.
A rune is a placeholder the compiler rewrites into plain css.
The runes ship on their own, so an analyzer or the compiler can depend on them
without pulling the whole framework, and VinoCSS re-exports them from `vinocss`.
