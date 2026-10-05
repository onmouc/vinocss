import { describe, expect, it } from "vitest"
import { decorate } from "@/index"

describe("decorate", () => {
  it("wraps a text with one sgr sequence and one reset", () => {
    expect(decorate("hi").bold().toString()).toBe("\u001B[1mhi\u001B[0m")
  })

  it("joins chained codes into one sequence", () => {
    expect(decorate("hi").bold().red().toString()).toBe("\u001B[1;31mhi\u001B[0m")
  })

  it("renders the plain text when no code is set", () => {
    expect(decorate("hi").toString()).toBe("hi")
  })

  it("keeps a base decorator plain, so the calls stay immutable", () => {
    const base = decorate("hi")
    base.red()
    expect(base.toString()).toBe("hi")
  })

  it("drops the gathered codes on reset", () => {
    expect(decorate("hi").bold().red().reset().toString()).toBe("hi")
  })
})

describe("style and color methods", () => {
  it("maps a style name to its sgr parameter", () => {
    expect(decorate("x").faint().toString()).toBe("\u001B[2mx\u001B[0m")
    expect(decorate("x").italic().toString()).toBe("\u001B[3mx\u001B[0m")
    expect(decorate("x").dim().toString()).toBe("\u001B[2mx\u001B[0m")
  })

  it("maps a foreground, a bright, and a background color", () => {
    expect(decorate("x").cyan().toString()).toBe("\u001B[36mx\u001B[0m")
    expect(decorate("x").gray().toString()).toBe("\u001B[90mx\u001B[0m")
    expect(decorate("x").bgBrightMagenta().toString()).toBe("\u001B[105mx\u001B[0m")
  })
})

describe("extended colors", () => {
  it("builds a 256-code color", () => {
    expect(decorate("x").fg256(196).toString()).toBe("\u001B[38;5;196mx\u001B[0m")
    expect(decorate("x").bg256(21).toString()).toBe("\u001B[48;5;21mx\u001B[0m")
  })

  it("builds an rgb color", () => {
    expect(decorate("x").rgb(1, 2, 3).toString()).toBe("\u001B[38;2;1;2;3mx\u001B[0m")
    expect(decorate("x").bgRgb(4, 5, 6).toString()).toBe("\u001B[48;2;4;5;6mx\u001B[0m")
  })

  it("rejects a value outside 0..255", () => {
    expect(() => decorate("x").fg256(256)).toThrow(RangeError)
    expect(() => decorate("x").rgb(-1, 0, 0)).toThrow(RangeError)
    expect(() => decorate("x").bgRgb(0, 1.5, 0)).toThrow(RangeError)
  })
})
