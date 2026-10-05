import { describe, expect, it } from "@rstest/core"
import { vinocss } from "@/index"

describe("vinocss plugin", () => {
  it("names the plugin after the package", () => {
    expect(vinocss().name).toBe("@vinocss/plugin-rsbuild")
  })
})
