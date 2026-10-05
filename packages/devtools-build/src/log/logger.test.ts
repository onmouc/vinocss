import { mkdtempSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import { Logger } from "@/log/logger"

const start = new Date(2013, 3, 15, 12, 34, 5, 678).getTime()

let temp = ""

afterEach(() => {
  if (temp !== "") rmSync(temp, { recursive: true, force: true })
  temp = ""
})

function capture(): { lines: string[]; sink: (line: string) => void } {
  const lines: string[] = []
  return { lines, sink: (line) => lines.push(line) }
}

describe("Logger line", () => {
  it("renders the name, level, time, message, and time cost", () => {
    let now = start
    const { lines, sink } = capture()
    const logger = new Logger({
      name: "app",
      time: true,
      delta: true,
      color: false,
      sink,
      now: () => now,
    })
    logger.info("first")
    now += 12
    logger.warn("second")
    expect(lines[0]).toBe("app [i] 2013.04.15(1) 12:34:05.678 first")
    expect(lines[1]).toBe("app [!] 2013.04.15(1) 12:34:05.690 second +12ms")
  })

  it("logs no name when the name is empty", () => {
    const { lines, sink } = capture()
    new Logger({ sink, color: false, now: () => start }).debug("hi")
    expect(lines[0]).toBe("[>] hi")
  })

  it("wraps the level marker in color when color is on", () => {
    const { lines, sink } = capture()
    new Logger({ sink, color: true, now: () => start }).info("hi")
    expect(lines[0]).toBe("\u001B[34m[i]\u001B[0m hi")
  })

  it("puts a detail on the next line, dim", () => {
    const { lines, sink } = capture()
    new Logger({ sink, color: true, now: () => start }).error("boom", "at line 1")
    expect(lines[0]).toBe("\u001B[31m[x]\u001B[0m boom\n\u001B[2m  at line 1\u001B[0m")
  })
})

describe("Logger time and sink", () => {
  it("reports the time since the previous call", () => {
    let now = start
    const logger = new Logger({ sink: () => {}, now: () => now })
    expect(logger.elapsed).toBeUndefined()
    logger.info("a")
    now += 25
    expect(logger.elapsed).toBe(25)
  })

  it("appends to a file when a file sink is set", () => {
    temp = mkdtempSync(join(tmpdir(), "utils-log-"))
    const file = join(temp, "app.log")
    const logger = new Logger({ file, now: () => start })
    logger.done("written")
    expect(readFileSync(file, "utf8")).toBe("[v] written\n")
    logger.close()
  })
})
