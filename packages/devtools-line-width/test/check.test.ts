import { execFileSync } from "node:child_process"
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { checkLineWidth } from "@/index"

let dir = ""

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "line-width-"))
  execFileSync("git", ["init"], { cwd: dir })
})

afterEach(() => rmSync(dir, { recursive: true, force: true }))

function track(files: Record<string, string>): void {
  for (const [name, content] of Object.entries(files)) {
    const file = join(dir, name)
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, content)
  }
  execFileSync("git", ["add", "-A"], { cwd: dir })
}

describe("checkLineWidth", () => {
  it("reports a tracked source file", () => {
    track({ "src/a.ts": `ok\n${"y".repeat(20)}\n` })
    const violations = checkLineWidth({ cwd: dir, max: 10 })
    expect(violations).toEqual([{ file: "src/a.ts", line: 2, column: 11, length: 20 }])
  })

  it("skips a tracked lockfile", () => {
    track({ "pnpm-lock.yaml": `${"z".repeat(40)}\n` })
    expect(checkLineWidth({ cwd: dir, max: 10 })).toEqual([])
  })

  it("limits the set with a git pathspec", () => {
    track({ "src/a.ts": `${"y".repeat(20)}\n`, "b.ts": `${"y".repeat(20)}\n` })
    const violations = checkLineWidth({ cwd: dir, max: 10, patterns: ["src"] })
    expect(violations.map((violation) => violation.file)).toEqual(["src/a.ts"])
  })

  it("checks an untracked file git does not ignore", () => {
    writeFileSync(join(dir, "new.ts"), `${"y".repeat(20)}\n`)
    const violations = checkLineWidth({ cwd: dir, max: 10 })
    expect(violations.map((violation) => violation.file)).toEqual(["new.ts"])
  })

  it("skips an untracked file git ignores", () => {
    writeFileSync(join(dir, ".gitignore"), "ignored.ts")
    writeFileSync(join(dir, "ignored.ts"), `${"y".repeat(20)}\n`)
    expect(checkLineWidth({ cwd: dir, max: 10 })).toEqual([])
  })
})
