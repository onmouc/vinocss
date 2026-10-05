import { describe, expect, it } from "vitest"
import { runScript } from "@/build/run"

describe("runScript", () => {
  it("rejects a script name with a shell metacharacter", async () => {
    await expect(runScript(process.cwd(), "build; rm -rf /")).rejects.toThrow(
      /invalid script name/u,
    )
  })
})
