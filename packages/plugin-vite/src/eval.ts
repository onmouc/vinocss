import { type AstNode, identifierName, templateText } from "@/ast"
import { propertyKey } from "@/emit"
import { stringOf, type Value } from "@/value"

/**
 * Evaluate one child expression, bound to the module it sits in.
 */
export type EvalExpr = (expr: AstNode) => Value

/**
 * Resolve a namespace member, such as `ns.ink`, to the value it exports.
 */
export type ResolveNamespace = (moduleId: string, key: string) => Value

export function evalLiteral(node: AstNode, moduleId: string): Value {
  const value = node.value
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return { t: "lit", v: value }
  }
  if (value === null) return { t: "lit", v: null }
  throw new Error(`vinocss: ${node.raw ?? "literal"} is not a static value in ${moduleId}`)
}

export function evalTemplate(node: AstNode, evaluate: EvalExpr): Value {
  const quasis = node.quasis ?? []
  const expressions = node.expressions ?? []
  let text = templateText(quasis[0])
  for (let i = 0; i < expressions.length; i++) {
    text += stringOf(evaluate(expressions[i]))
    text += templateText(quasis[i + 1])
  }
  return { t: "lit", v: text }
}

export function evalMember(
  node: AstNode,
  evaluate: EvalExpr,
  resolve: ResolveNamespace,
  moduleId: string,
): Value {
  const object = evaluate(node.object as AstNode)
  const key = node.computed
    ? stringOf(evaluate(node.property as AstNode))
    : (identifierName(node.property) ?? "")
  return memberOf(object, key, resolve, moduleId)
}

export function evalObjectProps(
  node: AstNode,
  evaluate: EvalExpr,
  moduleId: string,
): Map<string, Value> {
  const props = new Map<string, Value>()
  for (const property of node.properties ?? []) {
    if (property.type !== "Property" || property.method) {
      throw new Error(`vinocss: expected a static property in ${moduleId}`)
    }
    props.set(propertyKey(property, evaluate), evaluate(property.value as AstNode))
  }
  return props
}

export function evalItems(node: AstNode, evaluate: EvalExpr): Value[] {
  const items: Value[] = []
  for (const item of node.elements ?? []) if (item) items.push(evaluate(item))
  return items
}

export function evalUnary(node: AstNode, evaluate: EvalExpr, moduleId: string): Value {
  const value = evaluate(node.argument as AstNode)
  const sign = node.operator === "-" || node.operator === "+"
  if (sign && value.t === "lit" && typeof value.v === "number") {
    return { t: "lit", v: node.operator === "-" ? -value.v : value.v }
  }
  throw new Error(`vinocss: unsupported ${node.operator} expression in ${moduleId}`)
}

export function evalBinary(node: AstNode, evaluate: EvalExpr, moduleId: string): Value {
  if (node.operator !== "+")
    throw new Error(`vinocss: unsupported ${node.operator} expression in ${moduleId}`)
  const left = evaluate(node.left as AstNode)
  const right = evaluate(node.right as AstNode)
  if (
    left.t === "lit" &&
    right.t === "lit" &&
    typeof left.v === "number" &&
    typeof right.v === "number"
  ) {
    return { t: "lit", v: left.v + right.v }
  }
  return { t: "lit", v: stringOf(left) + stringOf(right) }
}

export function evalLogical(node: AstNode, evaluate: EvalExpr): Value {
  const left = node.left as AstNode
  const right = node.right as AstNode
  const truthy = truthOf(left, evaluate)
  const chosen = node.operator === "&&" ? (truthy ? right : left) : truthy ? left : right
  return evaluate(chosen)
}

export function evalConditional(node: AstNode, evaluate: EvalExpr): Value {
  const test = truthOf(node.test as AstNode, evaluate)
  return evaluate((test ? node.consequent : node.alternate) as AstNode)
}

function truthOf(expr: AstNode, evaluate: EvalExpr): boolean {
  const value = evaluate(expr)
  return value.t === "lit" ? Boolean(value.v) : true
}

function memberOf(object: Value, key: string, resolve: ResolveNamespace, moduleId: string): Value {
  if (object.t === "object") {
    const value = object.props.get(key)
    if (!value) throw new Error(`vinocss: ${key} is not a static property in ${moduleId}`)
    return value
  }
  if (object.t === "var") {
    const value = object.tree.props?.get(key)
    if (!value) throw new Error(`vinocss: ${key} is not a var$ leaf in ${moduleId}`)
    return { t: "var", tree: value }
  }
  if (object.t === "array") {
    const item = object.items[Number(key)]
    if (item === undefined) throw new Error(`vinocss: ${key} is not a static index in ${moduleId}`)
    return item
  }
  if (object.t === "namespace") return resolve(object.id, key)
  throw new Error(`vinocss: cannot read ${key} from a static value in ${moduleId}`)
}
