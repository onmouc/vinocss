import { parseSync } from "oxc-parser"

/**
 * The parts of an oxc node the compiler reads.
 *
 * The parser returns a full ESTree-shaped program, which is far richer than
 * this. Only the fields a static VinoCSS argument can use are named; the walk
 * reads every child through a record view, so an unlisted node is still
 * visited and its children are still found.
 */
export interface AstNode {
  type: string
  start: number
  end: number
  name?: string
  value?: unknown
  raw?: string
  kind?: string
  method?: boolean
  shorthand?: boolean
  computed?: boolean
  optional?: boolean
  prefix?: boolean
  operator?: string
  expression?: AstNode
  argument?: AstNode
  callee?: AstNode
  arguments?: AstNode[]
  object?: AstNode
  property?: AstNode
  left?: AstNode
  right?: AstNode
  test?: AstNode
  consequent?: AstNode
  alternate?: AstNode
  quasis?: AstNode[]
  expressions?: AstNode[]
  elements?: (AstNode | null)[]
  properties?: AstNode[]
  key?: AstNode
  body?: AstNode[]
  declarations?: AstNode[]
  id?: AstNode
  init?: AstNode | null
  source?: AstNode | null
  specifiers?: AstNode[]
  local?: AstNode
  imported?: AstNode
  exported?: AstNode
  declaration?: AstNode | null
  importKind?: string
  exportKind?: string
}

const wrappers = new Set([
  "ParenthesizedExpression",
  "TSAsExpression",
  "TSSatisfiesExpression",
  "TSNonNullExpression",
  "TSTypeAssertion",
  "TSInstantiationExpression",
  "ChainExpression",
])

/**
 * Parse a module with the standalone oxc parser.
 *
 * The parser is not tied to the bundler, so the compiler can run anywhere the
 * binding loads. The language follows the file extension, so a `.tsx` file is
 * read as JSX and a `.ts` file keeps its type assertions. The result is treated
 * as an AstNode, since the compiler only reads the static subset it names.
 */
export function parseModule(source: string, id: string): AstNode {
  const result = parseSync(id, source, { lang: langOf(id) })
  const error = result.errors.find((entry) => String(entry.severity) === "Error")
  if (error) throw new Error(`vinocss: cannot parse ${id}: ${error.message}`)
  return result.program as unknown as AstNode
}

/**
 * Strip the wrappers that carry no value, such as a type assertion or a chain.
 */
export function unwrap(node: AstNode): AstNode {
  let current = node
  while (wrappers.has(current.type) && current.expression) current = current.expression
  return current
}

/**
 * Visit a node and every descendant, so a pass can find a shape anywhere.
 */
export function walk(node: AstNode, visit: (node: AstNode) => void): void {
  visit(node)
  for (const value of Object.values(node as unknown as Record<string, unknown>)) {
    if (Array.isArray(value)) {
      for (const item of value) if (isNode(item)) walk(item, visit)
    } else if (isNode(value)) {
      walk(value, visit)
    }
  }
}

export function isNode(value: unknown): value is AstNode {
  if (typeof value !== "object" || value === null) return false
  const node = value as { type?: unknown; start?: unknown }
  return typeof node.type === "string" && typeof node.start === "number"
}

export function identifierName(node: AstNode | null | undefined): string | undefined {
  return node?.type === "Identifier" ? node.name : undefined
}

export function literalString(node: AstNode | null | undefined): string | undefined {
  if (node?.type !== "Literal") return undefined
  return typeof node.value === "string" ? node.value : undefined
}

/**
 * Read the text of a template element, cooked when the parser kept it.
 */
export function templateText(node: AstNode | undefined): string {
  const value = node?.value as { cooked?: string | null; raw?: string } | undefined
  return value?.cooked ?? value?.raw ?? ""
}

function langOf(id: string): "ts" | "tsx" | "js" | "jsx" {
  const file = id.split("?")[0]
  const extension = file.slice(file.lastIndexOf(".") + 1)
  if (extension === "tsx") return "tsx"
  if (extension === "jsx") return "jsx"
  if (extension === "ts" || extension === "mts" || extension === "cts") return "ts"
  return "js"
}
