import { describe, expect, it } from "vitest"
import { scanText } from "@/scan"

describe("scanText", () => {
  it("reports a line past the maximum at the first overflowing column", () => {
    const violations = scanText("a.ts", `ok\n${"x".repeat(11)}\n`, 10)
    expect(violations).toEqual([{ file: "a.ts", line: 2, column: 11, length: 11 }])
  })

  it("leaves a line exactly at the maximum alone", () => {
    expect(scanText("a.ts", "x".repeat(10), 10)).toEqual([])
  })

  it("measures a CRLF line without the carriage return", () => {
    expect(scanText("a.ts", `${"x".repeat(10)}\r\n`, 10)).toEqual([])
  })

  it("counts a character outside the basic plane once", () => {
    expect(scanText("a.ts", "👍".repeat(10), 10)).toEqual([])
  })
})
