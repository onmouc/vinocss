import { describe, expect, it } from "vitest"
import { formatTime, fullTimeFormat, resolveTimeFormat } from "@/log/time"

const date = new Date(2013, 3, 15, 12, 34, 5, 678)

describe("formatTime", () => {
  it("renders the full form with every part on", () => {
    expect(formatTime(date, fullTimeFormat)).toBe("2013.04.15(1) 12:34:05.678")
  })

  it("keeps only the parts a caller enabled", () => {
    expect(formatTime(date, { year: true })).toBe("2013")
    expect(formatTime(date, { monthDate: true, weekday: true })).toBe("04.15(1)")
    expect(formatTime(date, { time: true })).toBe("12:34")
    expect(formatTime(date, { time: true, second: true })).toBe("12:34:05")
    expect(formatTime(date, { time: true, millis: true })).toBe("12:34:05.678")
  })

  it("leaves an empty format empty", () => {
    expect(formatTime(date, {})).toBe("")
  })
})

describe("resolveTimeFormat", () => {
  it("turns the timestamp off for false and undefined", () => {
    expect(resolveTimeFormat(false)).toBeUndefined()
    expect(resolveTimeFormat()).toBeUndefined()
  })

  it("takes every part for true", () => {
    expect(resolveTimeFormat(true)).toEqual(fullTimeFormat)
  })

  it("overrides the full form one part at a time", () => {
    expect(resolveTimeFormat({ millis: false })).toEqual({ ...fullTimeFormat, millis: false })
  })
})
