import type { AstNode } from "@/ast"
import type { Program } from "@/program"
import { parseProgram } from "@/program"
import type { Host, Value } from "@/value"

/**
 * Resolve a static const across a tree of modules.
 *
 * A program is parsed once per module and a value is cached once per const, so
 * a diamond import stays linear. A value only ever reads another const, an
 * import, or an export; a reference cycle is caught and reported rather than
 * followed, which is what keeps a self-referential module from looping.
 */
export class Resolver {
  private readonly programs = new Map<string, Program>()
  private readonly values = new Map<string, Value>()
  private readonly resolving = new Set<string>()

  constructor(
    private readonly host: Host,
    private readonly evaluate: (expr: AstNode, moduleId: string) => Value,
  ) {}

  reset(): void {
    this.programs.clear()
    this.values.clear()
    this.resolving.clear()
  }

  cache(program: Program): void {
    this.programs.set(program.id, program)
  }

  getProgram(id: string): Program {
    const cached = this.programs.get(id)
    if (cached) return cached
    const source = this.host.read(id)
    if (source === undefined) throw new Error(`vinocss: cannot read ${id}`)
    const program = parseProgram(source, id)
    this.programs.set(id, program)
    return program
  }

  resolveSymbol(moduleId: string, name: string): Value {
    const key = `${moduleId}#${name}`
    const cached = this.values.get(key)
    if (cached) return cached
    if (this.resolving.has(key)) throw new Error(`vinocss: cyclic constant ${name} in ${moduleId}`)
    const program = this.getProgram(moduleId)
    this.resolving.add(key)
    try {
      const value = this.readSymbol(program, moduleId, name)
      this.values.set(key, value)
      return value
    } finally {
      this.resolving.delete(key)
    }
  }

  private readSymbol(program: Program, moduleId: string, name: string): Value {
    const symbol = program.symbols.get(name)
    if (symbol) return this.evaluate(symbol, moduleId)
    const binding = program.imports.get(name)
    if (!binding) throw new Error(`vinocss: ${name} is not a static const in ${moduleId}`)
    return this.resolveImport(binding.module, binding.imported, moduleId)
  }

  resolveImport(specifier: string, imported: string, importer: string): Value {
    const target = this.resolveModule(specifier, importer)
    if (target === null) throw new Error(`vinocss: ${specifier} does not expose static values`)
    if (imported === "*") return { t: "namespace", id: target }
    return this.resolveExport(target, imported, new Set())
  }

  resolveExport(moduleId: string, name: string, seen: Set<string>): Value {
    const value = this.lookupExport(moduleId, name, seen)
    if (value) return value
    throw new Error(`vinocss: ${name} is not exported by ${moduleId}`)
  }

  private lookupExport(moduleId: string, name: string, path: Set<string>): Value | undefined {
    const guard = `${moduleId}#${name}`
    if (path.has(guard)) throw new Error(`vinocss: cyclic export ${name} in ${moduleId}`)
    const seen = new Set(path).add(guard)
    const program = this.getProgram(moduleId)
    const entry = program.exports.get(name)
    if (entry?.type === "local") return this.resolveSymbol(moduleId, entry.name)
    if (entry?.type === "external") {
      const target = this.resolveModule(entry.module, moduleId)
      if (target === null) return undefined
      if (entry.name === "*") return { t: "namespace", id: target }
      return this.lookupExport(target, entry.name, seen)
    }
    if (program.symbols.has(name)) return this.resolveSymbol(moduleId, name)
    for (const specifier of program.starReexports) {
      const target = this.resolveModule(specifier, moduleId)
      if (target === null) continue
      const star = this.lookupExport(target, name, seen)
      if (star) return star
    }
    return undefined
  }

  resolveModule(specifier: string, importer: string): string | null {
    if (
      specifier === "vinocss" ||
      specifier === "vinocss/utils" ||
      specifier.startsWith("vinocss/")
    ) {
      return null
    }
    return this.host.resolve(specifier, importer) ?? null
  }
}
