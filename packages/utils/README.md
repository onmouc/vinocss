# @vinocss/utils

Small helpers that build a css value from a plain input,
such as `px(12)` for `"12px"` and `v("--brand")` for `"var(--brand)"`.
They ship on their own, so an analyzer or the compiler can depend on them
without pulling the whole framework, and VinoCSS re-exports them from `vinocss/utils`.
