import { describe, expect, it } from "vitest"
import { contentHash, kebabCase } from "@/css"

describe("contentHash", () => {
  it("returns the same hash for the same text", () => {
    expect(contentHash(".v1{color:red}")).toBe(contentHash(".v1{color:red}"))
  })

  it("changes the hash when the text changes", () => {
    expect(contentHash(".v1{color:red}")).not.toBe(contentHash(".v1{color:blue}"))
  })
})

describe("kebabCase", () => {
  it("keeps a custom property as written", () => {
    expect(kebabCase("--ink")).toBe("--ink")
  })

  it("splits a camel cased key", () => {
    expect(kebabCase("borderRadius")).toBe("border-radius")
  })

  it("gives a leading vendor prefix its dash", () => {
    expect(kebabCase("msFlex")).toBe("-ms-flex")
  })
})
