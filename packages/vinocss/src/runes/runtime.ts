/**
 * Report a VinoCSS call that ran before the compiler could replace it.
 *
 * Every public function is a compile-time placeholder:
 * the compiler rewrites the call into plain css and drops the function.
 * A call that reaches the runtime therefore means the compiler never ran,
 * which is an error the caller must fix in the build.
 */
export function uncompiled(api: string, value: unknown): never {
  const kind = typeof value === "object" ? "an object" : `a ${typeof value}`
  throw new Error(
    `vinocss: ${api}() ran without the compiler and received ${kind}; ` +
      "add the vinocss compiler to the build",
  )
}
