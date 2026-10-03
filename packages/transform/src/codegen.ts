import { contentHash } from "@/css"
import type { VarTree } from "@/value"

/**
 * One rewrite of a source range, from a call to the text that replaces it.
 */
export interface Edit {
  start: number
  end: number
  text: string
}

/**
 * Mint a custom property name for a null leaf.
 *
 * The name is hashed from the file, the call position, and the leaf path, so
 * it is unique per leaf and stable across builds without a running counter.
 */
export function mintVar(moduleId: string, callStart: number, path: string[]): string {
  return `--${contentHash(`${moduleId}:${callStart}:${path.join(".")}`)}`
}

/**
 * Write a resolved `var$` tree as the object or string literal it becomes.
 */
export function varTreeToJs(tree: VarTree): string {
  if (tree.leaf !== undefined) return JSON.stringify(tree.leaf)
  const entries: string[] = []
  for (const [key, child] of tree.props ?? new Map<string, VarTree>()) {
    entries.push(`${propKey(key)}:${varTreeToJs(child)}`)
  }
  return `{${entries.join(",")}}`
}

function propKey(key: string): string {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/u.test(key) ? key : JSON.stringify(key)
}

/**
 * Drop every edit nested inside another, since the outer rewrite replaces it.
 */
export function outermost(edits: Edit[]): Edit[] {
  const sorted = [...edits].toSorted((a, b) => a.start - b.start || b.end - a.end)
  const out: Edit[] = []
  for (const edit of sorted) {
    const last = out.at(-1)
    if (last && edit.start >= last.start && edit.end <= last.end) continue
    out.push(edit)
  }
  return out
}

/**
 * Apply edits from the end first, so an earlier range keeps its offsets.
 */
export function applyEdits(source: string, edits: Edit[]): string {
  let out = source
  for (let i = edits.length - 1; i >= 0; i--) {
    const edit = edits[i]
    out = out.slice(0, edit.start) + edit.text + out.slice(edit.end)
  }
  return out
}
