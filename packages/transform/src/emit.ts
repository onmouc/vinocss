import { type AstNode, identifierName, literalString, unwrap } from "@/ast"
import { kebabCase } from "@/css"
import { stringOf, type Value } from "@/value"

/**
 * Evaluate one style expression, provided by the compiler that owns the state.
 */
export type Evaluate = (expr: AstNode) => Value

/**
 * Emit the css for one style object under a selector.
 *
 * A scalar property becomes a declaration, an array becomes one declaration
 * per fallback, and an object becomes a nested rule: an at-rule keeps its
 * block around the same selector, while a selector key extends it, with `&`
 * standing for the current selector so a final pass can fill in the class.
 */
export function emitObject(
  selector: string,
  object: AstNode,
  moduleId: string,
  evaluate: Evaluate,
): string {
  const decls: string[] = []
  const nested: string[] = []
  for (const property of object.properties ?? []) {
    if (
      property.type !== "Property" ||
      property.method ||
      (property.kind && property.kind !== "init")
    ) {
      throw new Error(`vinocss: class$ needs plain properties in ${moduleId}`)
    }
    const key = propertyKey(property, evaluate)
    const value = unwrap(property.value as AstNode)
    if (value.type === "ObjectExpression")
      nested.push(emitNested(key, selector, value, moduleId, evaluate))
    else if (value.type === "ArrayExpression") {
      for (const item of value.elements ?? []) {
        if (item) decls.push(`${kebabCase(key)}:${styleValue(item, moduleId, evaluate)}`)
      }
    } else decls.push(`${kebabCase(key)}:${styleValue(value, moduleId, evaluate)}`)
  }
  const current = decls.length > 0 ? `${selector}{${decls.join(";")}}` : ""
  return [current, ...nested].filter((rule) => rule !== "").join("")
}

function emitNested(
  key: string,
  selector: string,
  object: AstNode,
  moduleId: string,
  evaluate: Evaluate,
): string {
  if (key.startsWith("@")) {
    const inner = emitObject(selector, object, moduleId, evaluate)
    return inner === "" ? "" : `${key}{${inner}}`
  }
  const child = key.includes("&") ? key.replaceAll("&", selector) : `${selector}${key}`
  return emitObject(child, object, moduleId, evaluate)
}

/**
 * Read a style value.
 *
 * A `var$` leaf is a custom property name such as `--ink`, not a `var()`
 * reference, so it is written as the author left it. To use it as a css value
 * the author wraps it, for example with `v(theme.ink)` or a `var()` template.
 */
export function styleValue(expr: AstNode, moduleId: string, evaluate: Evaluate): string {
  const value = evaluate(expr)
  if (value.t === "var") {
    if (value.tree.leaf === undefined)
      throw new Error(`vinocss: class$ value is a var$ record in ${moduleId}`)
    return value.tree.leaf
  }
  if (value.t === "lit" && (typeof value.v === "string" || typeof value.v === "number")) {
    return String(value.v)
  }
  throw new Error(`vinocss: class$ value must be a static literal or var$ name in ${moduleId}`)
}

/**
 * Read a property key, which is a name, a string, or a computed expression.
 */
export function propertyKey(property: AstNode, evaluate: Evaluate): string {
  if (!property.computed) {
    const name = identifierName(property.key) ?? literalString(property.key)
    if (name !== undefined) return name
    throw new Error("vinocss: class$ needs a static key")
  }
  return stringOf(evaluate(property.key as AstNode))
}

/**
 * Read a `style$` selector key, which must be a literal.
 *
 * Unlike a style property key, a selector is never computed: a `style$` entry
 * names a global selector such as `body` or `:root`, so a computed or dynamic
 * key has no class name to fall back on and is a compile-time error.
 */
export function selectorKey(property: AstNode, moduleId: string): string {
  if (property.computed) throw new Error(`vinocss: style$ needs a literal selector in ${moduleId}`)
  const name = identifierName(property.key) ?? literalString(property.key)
  if (name === undefined) throw new Error(`vinocss: style$ needs a literal selector in ${moduleId}`)
  return name
}
