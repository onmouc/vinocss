import { type AstNode, identifierName, literalString, parseModule, walk } from "@/ast"

/**
 * A binding a module imports, before its specifier is resolved to a file.
 */
export interface ImportBinding {
  module: string
  imported: string
}

/**
 * What a module exports: a local binding, or a name re-exported from a module.
 */
export type ExportEntry =
  | { type: "local"; name: string }
  | { type: "external"; module: string; name: string }

/**
 * The static surface of a module: its consts, imports, exports, and VinoCSS calls.
 *
 * The map of consts is flat, since a VinoCSS argument may only read a static
 * const. Calls keep the parsed node, whose `start` and `end` give the range a
 * transform replaces, so the caller never re-parses the module.
 */
export interface Program {
  id: string
  symbols: Map<string, AstNode>
  imports: Map<string, ImportBinding>
  exports: Map<string, ExportEntry>
  starReexports: string[]
  calls: AstNode[]
}

const runes = new Set(["var$", "class$"])

/**
 * Read the static surface of a module from its source.
 *
 * The whole program is walked once: a `const` binds its name to the init
 * expression, and every `var$` or `class$` call is collected wherever it sits,
 * including one inline in a template or a JSX attribute. The top level is then
 * read for imports and exports, which only ever sit there.
 */
export function parseProgram(source: string, id: string): Program {
  const root = parseModule(source, id)
  const symbols = new Map<string, AstNode>()
  const calls: AstNode[] = []
  walk(root, (node) => {
    if (node.type === "VariableDeclaration" && node.kind === "const") collectConsts(node, symbols)
    else if (node.type === "CallExpression" && runes.has(identifierName(node.callee) ?? ""))
      calls.push(node)
  })
  const imports = new Map<string, ImportBinding>()
  const exports = new Map<string, ExportEntry>()
  const starReexports: string[] = []
  for (const statement of root.body ?? []) {
    if (statement.type === "ExportDefaultDeclaration" && statement.declaration) {
      symbols.set("default", statement.declaration)
    }
    readModuleStatement(statement, imports, exports, starReexports)
  }
  return { id, symbols, imports, exports, starReexports, calls }
}

function collectConsts(declaration: AstNode, symbols: Map<string, AstNode>): void {
  for (const declarator of declaration.declarations ?? []) {
    const name = identifierName(declarator.id)
    if (name !== undefined && declarator.init) symbols.set(name, declarator.init)
  }
}

function readModuleStatement(
  statement: AstNode,
  imports: Map<string, ImportBinding>,
  exports: Map<string, ExportEntry>,
  starReexports: string[],
): void {
  if (statement.type === "ImportDeclaration") readImport(statement, imports)
  else if (statement.type === "ExportNamedDeclaration") readNamedExport(statement, exports)
  else if (statement.type === "ExportAllDeclaration")
    readStarExport(statement, exports, starReexports)
  else if (statement.type === "ExportDefaultDeclaration" && statement.declaration) {
    exports.set("default", { type: "local", name: "default" })
  }
}

function readImport(statement: AstNode, imports: Map<string, ImportBinding>): void {
  if (statement.importKind === "type") return
  const module = literalString(statement.source)
  if (module === undefined) return
  for (const specifier of statement.specifiers ?? []) {
    if (specifier.importKind === "type") continue
    const local = identifierName(specifier.local)
    if (local === undefined) continue
    if (specifier.type === "ImportDefaultSpecifier")
      imports.set(local, { module, imported: "default" })
    else if (specifier.type === "ImportNamespaceSpecifier")
      imports.set(local, { module, imported: "*" })
    else {
      const imported = exportedName(specifier.imported)
      if (imported !== undefined) imports.set(local, { module, imported })
    }
  }
}

function readNamedExport(statement: AstNode, exports: Map<string, ExportEntry>): void {
  const module = literalString(statement.source)
  if (statement.declaration) {
    if (statement.declaration.type !== "VariableDeclaration") return
    for (const declarator of statement.declaration.declarations ?? []) {
      const name = identifierName(declarator.id)
      if (name !== undefined) exports.set(name, { type: "local", name })
    }
    return
  }
  if (statement.exportKind === "type") return
  for (const specifier of statement.specifiers ?? []) {
    if (specifier.exportKind === "type") continue
    const local = exportedName(specifier.local)
    const exported = exportedName(specifier.exported)
    if (local === undefined || exported === undefined) continue
    if (module === undefined) exports.set(exported, { type: "local", name: local })
    else exports.set(exported, { type: "external", module, name: local })
  }
}

function readStarExport(
  statement: AstNode,
  exports: Map<string, ExportEntry>,
  starReexports: string[],
): void {
  const module = literalString(statement.source)
  if (module === undefined) return
  const exported = identifierName(statement.exported)
  if (exported === undefined) starReexports.push(module)
  else exports.set(exported, { type: "external", module, name: "*" })
}

function exportedName(node: AstNode | null | undefined): string | undefined {
  return identifierName(node) ?? literalString(node)
}
