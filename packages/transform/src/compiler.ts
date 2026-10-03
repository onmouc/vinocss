import { type AstNode, identifierName, unwrap } from "@/ast"
import { applyEdits, type Edit, mintVar, outermost, varTreeToJs } from "@/codegen"
import { contentHash } from "@/css"
import { emitObject, selectorKey } from "@/emit"
import {
  type EvalExpr,
  evalBinary,
  evalConditional,
  evalItems,
  evalLiteral,
  evalLogical,
  evalMember,
  evalObjectProps,
  evalTemplate,
  evalUnary,
} from "@/eval"
import { type Program, parseProgram } from "@/program"
import { Resolver } from "@/resolver"
import { type Host, stringOf, type Value, type VarTree } from "@/value"

/**
 * The unit helper names, shared with the `vinocss/utils` exports by a test.
 */
export const unitHelpers = new Set([
  "px",
  "cm",
  "mm",
  "q",
  "pt",
  "pc",
  "em",
  "rem",
  "ex",
  "ch",
  "lh",
  "rlh",
  "vw",
  "vh",
  "vmin",
  "vmax",
  "svw",
  "svh",
  "lvw",
  "lvh",
  "dvw",
  "dvh",
  "cqw",
  "cqh",
  "cqi",
  "cqb",
  "cqmin",
  "cqmax",
])

/**
 * The specifier prefix of the css module a compile frees.
 *
 * A bundler plugin reads it to recognize the virtual import, then resolves
 * the id to the css a compile stored for it.
 */
export const virtualCssPrefix = "virtual:vinocss/"

/**
 * The result of compiling one module.
 *
 * `code` is the rewritten source, `css` is the rules its `class$` and `style$`
 * calls produced, and `virtualId` is the module a caller should resolve to load
 * that css, or null when the module generated no rule.
 */
export interface CompileResult {
  code: string
  css: string
  virtualId: string | null
}

/**
 * Compile VinoCSS calls across a tree of modules.
 *
 * One compiler parses each module once and resolves each value once,
 * and a value must be a static literal, a record, a `var$` tree, or a class name.
 *
 * ## Throws
 *
 * - A `var$`, `class$`, or `style$` argument that would need to run first.
 * - A name, selector, or import that is not a static value.
 */
export class Compiler {
  private readonly resolver: Resolver
  private readonly classes = new Map<string, { className: string; css: string }>()
  private readonly moduleRules = new Map<string, Map<number, string>>()
  private readonly cssFiles = new Map<string, string>()

  constructor(host: Host) {
    this.resolver = new Resolver(host, (expr, moduleId) => this.evalExpr(expr, moduleId))
  }

  /**
   * Compile a module and return its rewritten code and generated css.
   *
   * Every `var$` call becomes the names it resolved to, every `class$` call
   * becomes its class name, and every `style$` call is dropped, with one css
   * import added when the module generated any rule.
   */
  compile(source: string, id: string): CompileResult {
    this.resolver.reset()
    this.classes.clear()
    const program = parseProgram(source, id)
    this.resolver.cache(program)
    this.moduleRules.delete(id)
    const edits: Edit[] = program.calls.map((call) => ({
      start: call.start,
      end: call.end,
      text: this.callReplacement(call, id),
    }))
    let code = applyEdits(source, outermost(edits))
    const css = this.cssFor(id)
    const virtualId = `${virtualCssPrefix}${contentHash(id)}.css`
    if (css === "") {
      this.cssFiles.delete(virtualId)
      return { code, css, virtualId: null }
    }
    this.cssFiles.set(virtualId, css)
    code = `import ${JSON.stringify(virtualId)}\n${code}`
    return { code, css, virtualId }
  }

  /**
   * The css a virtual module id holds, or an empty string when unknown.
   */
  readCss(virtualId: string): string {
    return this.cssFiles.get(virtualId) ?? ""
  }

  private callReplacement(call: AstNode, id: string): string {
    const name = identifierName(call.callee)
    if (name === "var$") return varTreeToJs(this.evalVarCall(call, id))
    if (name === "class$") return JSON.stringify(this.evalClassCall(call, id))
    if (name === "style$") return this.evalStyleCall(call, id)
    throw new Error(`vinocss: unsupported call ${name ?? "expression"} in ${id}`)
  }

  private cssFor(id: string): string {
    const rules = this.moduleRules.get(id)
    return rules ? [...rules.values()].join("\n") : ""
  }

  private evalExpr(expr: AstNode, moduleId: string): Value {
    const node = unwrap(expr)
    const evaluate: EvalExpr = (child) => this.evalExpr(child, moduleId)
    const resolve = (id: string, key: string): Value =>
      this.resolver.resolveExport(id, key, new Set())
    switch (node.type) {
      case "Literal":
        return evalLiteral(node, moduleId)
      case "Identifier":
        return this.evalIdent(node.name ?? "", moduleId)
      case "TemplateLiteral":
        return evalTemplate(node, evaluate)
      case "CallExpression":
        return this.evalCall(node, moduleId)
      case "MemberExpression":
        return evalMember(node, evaluate, resolve, moduleId)
      case "ObjectExpression":
        return { t: "object", props: evalObjectProps(node, evaluate, moduleId) }
      case "ArrayExpression":
        return { t: "array", items: evalItems(node, evaluate) }
      case "UnaryExpression":
        return evalUnary(node, evaluate, moduleId)
      case "BinaryExpression":
        return evalBinary(node, evaluate, moduleId)
      case "LogicalExpression":
        return evalLogical(node, evaluate)
      case "ConditionalExpression":
        return evalConditional(node, evaluate)
      default:
        throw new Error(`vinocss: ${node.type} is dynamic in ${moduleId}`)
    }
  }

  private evalIdent(name: string, moduleId: string): Value {
    if (name === "undefined") return { t: "lit", v: undefined }
    const program = this.resolver.getProgram(moduleId)
    if (program.symbols.has(name) || program.imports.has(name)) {
      return this.resolver.resolveSymbol(moduleId, name)
    }
    throw new Error(`vinocss: ${name} is dynamic; a static const is required in ${moduleId}`)
  }

  private evalCall(node: AstNode, moduleId: string): Value {
    const name = identifierName(node.callee)
    if (name === "var$") return { t: "var", tree: this.evalVarCall(node, moduleId) }
    if (name === "class$") return { t: "lit", v: this.evalClassCall(node, moduleId) }
    const program = this.resolver.getProgram(moduleId)
    const helper =
      name !== undefined && !program.symbols.has(name) && isVinocssHelper(name, program)
    if (name === "v" && helper) {
      return { t: "lit", v: `var(${stringOf(this.expectArg(node, moduleId))})` }
    }
    if (name !== undefined && helper && unitHelpers.has(name)) {
      return { t: "lit", v: this.evalUnit(name, node, moduleId) }
    }
    throw new Error(`vinocss: unsupported call ${name ?? "expression"} in ${moduleId}`)
  }

  private evalVarCall(call: AstNode, moduleId: string): VarTree {
    return this.toVarTree(this.expectArg(call, moduleId), moduleId, call.start, [])
  }

  private toVarTree(value: Value, moduleId: string, callStart: number, path: string[]): VarTree {
    if (value.t === "lit") {
      if (typeof value.v === "string") {
        if (value.v === "") throw new Error(`vinocss: var$ name cannot be empty in ${moduleId}`)
        return { leaf: `--${value.v}` }
      }
      if (value.v === null) return { leaf: mintVar(moduleId, callStart, path) }
    }
    if (value.t === "object") {
      const props = new Map<string, VarTree>()
      for (const [key, child] of value.props) {
        props.set(key, this.toVarTree(child, moduleId, callStart, [...path, key]))
      }
      return { props }
    }
    throw new Error(`vinocss: var$ accepts a string, null, or a record in ${moduleId}`)
  }

  private evalClassCall(call: AstNode, moduleId: string): string {
    const cacheKey = `${moduleId}:${call.start}`
    const cached = this.classes.get(cacheKey)
    if (cached) return cached.className
    const arg = call.arguments?.[0]
    const object = arg ? unwrap(arg) : undefined
    if (!object || object.type !== "ObjectExpression") {
      throw new Error(`vinocss: class$ needs a style object in ${moduleId}`)
    }
    const body = emitObject("&", object, moduleId, (expr) => this.evalExpr(expr, moduleId))
    if (body === "")
      throw new Error(`vinocss: class$ needs at least one declaration in ${moduleId}`)
    const className = `v${contentHash(body)}`
    const css = body.replaceAll("&", `.${className}`)
    this.classes.set(cacheKey, { className, css })
    this.addRule(moduleId, call.start, css)
    return className
  }

  private evalStyleCall(call: AstNode, moduleId: string): string {
    const arg = call.arguments?.[0]
    const object = arg ? unwrap(arg) : undefined
    if (!object || object.type !== "ObjectExpression")
      throw new Error(`vinocss: style$ needs a selector object in ${moduleId}`)
    const rules: string[] = []
    for (const property of object.properties ?? []) {
      if (
        property.type !== "Property" ||
        property.method ||
        (property.kind && property.kind !== "init")
      ) {
        throw new Error(`vinocss: style$ needs plain selectors in ${moduleId}`)
      }
      const selector = selectorKey(property, moduleId)
      const value = unwrap(property.value as AstNode)
      if (value.type !== "ObjectExpression")
        throw new Error(`vinocss: style$ selector ${selector} needs a style object in ${moduleId}`)
      const rule = emitObject(selector, value, moduleId, (expr) => this.evalExpr(expr, moduleId))
      if (rule !== "") rules.push(rule)
    }
    const css = rules.join("")
    if (css === "") throw new Error(`vinocss: style$ needs at least one rule in ${moduleId}`)
    this.addRule(moduleId, call.start, css)
    return "void 0"
  }

  private addRule(moduleId: string, start: number, css: string): void {
    const rules = this.moduleRules.get(moduleId) ?? new Map<number, string>()
    rules.set(start, css)
    this.moduleRules.set(moduleId, rules)
  }

  private evalUnit(name: string, node: AstNode, moduleId: string): string {
    const value = this.expectArg(node, moduleId)
    if (value.t !== "lit" || typeof value.v !== "number") {
      throw new Error(`vinocss: ${name}() needs a number in ${moduleId}`)
    }
    return `${value.v}${name}`
  }

  private expectArg(node: AstNode, moduleId: string): Value {
    const arg = node.arguments?.[0]
    if (!arg)
      throw new Error(
        `vinocss: ${identifierName(node.callee) ?? "call"} needs an argument in ${moduleId}`,
      )
    return this.evalExpr(arg, moduleId)
  }
}

function isVinocssHelper(name: string, program: Program): boolean {
  const module = program.imports.get(name)?.module
  return module === "vinocss/utils" || module === "vinocss"
}
