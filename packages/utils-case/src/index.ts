/**
 * Split a name into words, and rebuild them in a common case.
 *
 * A style key, an identifier, or a file name usually carries several words but
 * no single convention, so one split feeds every case a caller may want.
 * The split keeps every letter and digit, so a rebuild can rejoin them.
 *
 * ## Split rules
 *
 * - A non-alphanumeric character is dropped and separates the words around it.
 * - The input starts on its first letter, and a leading digit is dropped with it.
 * - A lower case letter followed by an upper case letter ends the current word.
 * - An upper case run followed by a lower case letter ends just before its last
 *   capital, so `HTTPServer` splits into `HTTP` and `Server`.
 * - A run of upper case letters stays one word, so `HTTP` is left whole.
 * - A digit is a word apart from a letter, and a digit run stays one word.
 */
export class CaseConvert {
  /** The words the input split into, in order. */
  readonly words: string[]

  constructor(value: string) {
    this.words = splitWords(value)
  }

  /** Join the words as `camelCase`. */
  camel(): string {
    return this.words
      .map((word, index) => (index === 0 ? word.toLowerCase() : capitalize(word)))
      .join("")
  }

  /** Join the words as `PascalCase`. */
  pascal(): string {
    return this.words.map(capitalize).join("")
  }

  /** Join the words lower case with a hyphen, as `kebab-case`. */
  kebab(): string {
    return this.words.map((word) => word.toLowerCase()).join("-")
  }

  /** Join the words lower case with an underscore, as `snake_case`. */
  snake(): string {
    return this.words.map((word) => word.toLowerCase()).join("_")
  }

  /** Join the words upper case with an underscore, as `CONSTANT_CASE`. */
  constant(): string {
    return this.words.map((word) => word.toUpperCase()).join("_")
  }

  /** Join the words lower case with a dot, as `dot.case`. */
  dot(): string {
    return this.words.map((word) => word.toLowerCase()).join(".")
  }

  /** Join the words lower case with a space, as `space case`. */
  space(): string {
    return this.words.map((word) => word.toLowerCase()).join(" ")
  }

  /** Join the words capitalized with a space, as `Title Case`. */
  title(): string {
    return this.words.map(capitalize).join(" ")
  }
}

/**
 * Convert a name, so `cased(value)` means `new CaseConvert(value)`.
 */
export function cased(value: string): CaseConvert {
  return new CaseConvert(value)
}

/**
 * Split a name into its words.
 *
 * The words keep the case they were written in;
 * see `CaseConvert` for how a boundary is found.
 */
export function splitWords(value: string): string[] {
  const words: string[] = []
  let word = ""
  let started = false
  for (let i = 0; i < value.length; i++) {
    const char = value[i]
    if (!isLetter(char) && !isDigit(char)) {
      if (word !== "") words.push(word)
      word = ""
      continue
    }
    if (!started) {
      if (isDigit(char)) continue
      started = true
    }
    if (word === "") {
      word = char
      continue
    }
    const prev = word.at(-1)
    if (startsWord(char, prev, value[i + 1])) {
      words.push(word)
      word = char
      continue
    }
    word += char
  }
  if (word !== "") words.push(word)
  return words
}

function startsWord(char: string, prev: string | undefined, next: string | undefined): boolean {
  if (isDigit(char) !== isDigit(prev)) return true
  if (!isUpper(char)) return false
  return isLower(prev) || isLower(next)
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
}

function isUpper(char: string | undefined): boolean {
  return char !== undefined && char >= "A" && char <= "Z"
}

function isLower(char: string | undefined): boolean {
  return char !== undefined && char >= "a" && char <= "z"
}

function isDigit(char: string | undefined): boolean {
  return char !== undefined && char >= "0" && char <= "9"
}

function isLetter(char: string | undefined): boolean {
  return isUpper(char) || isLower(char)
}
