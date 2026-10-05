import { describe, expect, it } from "vitest"
import { parseModule } from "@/ast"
import {
  type EvalExpr,
  evalBinary,
  evalConditional,
  evalLiteral,
  evalLogical,
  evalUnary,
} from "@/eval"
import type { Value } from "@/value"

const id = "a.ts"

const evaluate: EvalExpr = (node) => {
  switch (node.type) {
    case "Literal":
      return evalLiteral(node, id)
    case "UnaryExpression":
      return evalUnary(node, evaluate, id)
    case "BinaryExpression":
      return evalBinary(node, evaluate, id)
    case "LogicalExpression":
      return evalLogical(node, evaluate)
    case "ConditionalExpression":
      return evalConditional(node, evaluate)
    default:
      throw new Error(`unexpected ${node.type}`)
  }
}

function evalExpr(source: string): Value {
  const root = parseModule(`export const value = ${source}`, id)
  const init = root.body?.[0].declaration?.declarations?.[0].init
  if (!init) throw new Error("no expression")
  return evaluate(init)
}

describe("evalLiteral", () => {
  it("reads a string, a number, and a boolean", () => {
    expect(evalExpr('"red"')).toEqual({ t: "lit", v: "red" })
    expect(evalExpr("4")).toEqual({ t: "lit", v: 4 })
    expect(evalExpr("true")).toEqual({ t: "lit", v: true })
  })

  it("rejects a literal that is not static", () => {
    expect(() => evalExpr("/x/")).toThrow(/not a static value/u)
  })
})

describe("evalUnary", () => {
  it("applies a numeric sign", () => {
    expect(evalExpr("-4")).toEqual({ t: "lit", v: -4 })
    expect(evalExpr("+4")).toEqual({ t: "lit", v: 4 })
  })
})

describe("evalBinary", () => {
  it("adds two numbers", () => {
    expect(evalExpr("2 + 3")).toEqual({ t: "lit", v: 5 })
  })

  it("joins two strings", () => {
    expect(evalExpr('"a" + "b"')).toEqual({ t: "lit", v: "ab" })
  })
})

describe("evalLogical", () => {
  it("returns the operand the operator selects", () => {
    expect(evalExpr('"a" && "b"')).toEqual({ t: "lit", v: "b" })
    expect(evalExpr('"" || "b"')).toEqual({ t: "lit", v: "b" })
    expect(evalExpr('"a" || "b"')).toEqual({ t: "lit", v: "a" })
  })
})

describe("evalConditional", () => {
  it("evaluates the branch the test selects", () => {
    expect(evalExpr('true ? "a" : "b"')).toEqual({ t: "lit", v: "a" })
    expect(evalExpr('false ? "a" : "b"')).toEqual({ t: "lit", v: "b" })
  })
})
