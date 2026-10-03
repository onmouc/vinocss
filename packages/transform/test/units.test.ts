import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { unitHelpers } from "@/compiler"

function exportedNames(file: string): Set<string> {
  const url = new URL(`../../vinocss/src/utils/${file}`, import.meta.url)
  const source = readFileSync(url, "utf8")
  return new Set([...source.matchAll(/export const (\w+) =/gu)].map((match) => match[1]))
}

describe("unit helpers", () => {
  it("matches the vinocss unit exports", () => {
    expect(exportedNames("unit.ts")).toEqual(unitHelpers)
  })

  it("knows the var reference helper", () => {
    expect(exportedNames("var.ts").has("v")).toBe(true)
  })
})
