import { describe, expect, it } from "vitest"
import * as utils from "vinocss/utils"
import { lines } from "@vinocss/utils-lines"
import { compile } from "./helpers"

const helpers = utils as unknown as Record<string, (value: string) => string>

function source(helper: string): string {
  return lines(
    'import { class$ } from "vinocss"',
    `import { ${helper} } from "vinocss/utils"`,
    `export const card = class$({ width: ${helper}("2") })`,
  )
}

describe("value helpers", () => {
  it("applies every vinocss/utils helper", () => {
    for (const helper of Object.keys(helpers))
      expect(compile({ "a.ts": source(helper) }, "a.ts").css).toContain(
        `width:${helpers[helper]("2")}`,
      )
  })

  it("reads an aliased helper", () => {
    const aliased = lines(
      'import { class$ } from "vinocss"',
      'import { px as space } from "vinocss/utils"',
      "export const card = class$({ width: space(2) })",
    )
    expect(compile({ "a.ts": aliased }, "a.ts").css).toContain("width:2px")
  })
})
