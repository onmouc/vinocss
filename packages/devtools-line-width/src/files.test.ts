import { describe, expect, it } from "vitest"
import { isLockfile } from "@/files"

describe("isLockfile", () => {
  it("matches a known lockfile name at any depth", () => {
    expect(isLockfile("pnpm-lock.yaml")).toBe(true)
    expect(isLockfile("packages/a/yarn.lock")).toBe(true)
  })

  it("matches any file with a lock extension", () => {
    expect(isLockfile("some/dir/bun.lock")).toBe(true)
  })

  it("leaves an ordinary source file alone", () => {
    expect(isLockfile("src/lock.ts")).toBe(false)
  })
})
