import {
  bg256Sgr,
  bgRgbSgr,
  bgSgr,
  brightBgSgr,
  brightFgSgr,
  defaultBgSgr,
  defaultFgSgr,
  fg256Sgr,
  fgRgbSgr,
  fgSgr,
} from "@/colors"
import { styleSgr } from "@/style"

const esc = "\u001B"
const resetSequence = `${esc}[0m`

/**
 * Wrap a text in ansi sgr escape sequences for terminal output.
 *
 * Each style or color method returns a new `Decorator` that carries the codes
 * gathered so far, so the calls chain. `toString` joins every code into one
 * sgr sequence and appends one reset, which is the form ansi defines for sgr.
 * A decorator with no code renders its text unchanged.
 */
export class Decorator {
  /** The text the decorator wraps. */
  readonly text: string

  /** The sgr parameters gathered so far, in call order. */
  readonly sgr: readonly number[]

  constructor(text: string, sgr: readonly number[] = []) {
    this.text = text
    this.sgr = sgr
  }

  /**
   * Add raw sgr parameters.
   *
   * Use it for a code that has no named method, such as a font selection,
   * and reach for a named method otherwise.
   */
  code(...params: number[]): Decorator {
    return new Decorator(this.text, [...this.sgr, ...params])
  }

  /** Drop every gathered parameter, so the text renders plain again. */
  reset(): Decorator {
    return new Decorator(this.text)
  }

  /** Render the text with one sgr sequence and one reset. */
  toString(): string {
    if (this.sgr.length === 0) return this.text
    return `${esc}[${this.sgr.join(";")}m${this.text}${resetSequence}`
  }

  bold(): Decorator {
    return this.code(styleSgr.bold)
  }
  faint(): Decorator {
    return this.code(styleSgr.faint)
  }
  /** Alias of `faint`, from the terminal term for a lower intensity. */
  dim(): Decorator {
    return this.code(styleSgr.faint)
  }
  italic(): Decorator {
    return this.code(styleSgr.italic)
  }
  underline(): Decorator {
    return this.code(styleSgr.underline)
  }
  doubleUnderline(): Decorator {
    return this.code(styleSgr.doubleUnderline)
  }

  blink(): Decorator {
    return this.code(styleSgr.blink)
  }
  rapidBlink(): Decorator {
    return this.code(styleSgr.rapidBlink)
  }
  reverse(): Decorator {
    return this.code(styleSgr.reverse)
  }
  /** Alias of `reverse`, from the terminal term for swapped colors. */
  invert(): Decorator {
    return this.code(styleSgr.reverse)
  }
  conceal(): Decorator {
    return this.code(styleSgr.conceal)
  }
  /** Alias of `conceal`, from the terminal term for an invisible text. */
  hidden(): Decorator {
    return this.code(styleSgr.conceal)
  }
  crossedOut(): Decorator {
    return this.code(styleSgr.crossedOut)
  }
  /** Alias of `crossedOut`, from the term a browser uses for the same line. */
  strikethrough(): Decorator {
    return this.code(styleSgr.crossedOut)
  }
  overlined(): Decorator {
    return this.code(styleSgr.overlined)
  }

  black(): Decorator {
    return this.code(fgSgr.black)
  }
  red(): Decorator {
    return this.code(fgSgr.red)
  }
  green(): Decorator {
    return this.code(fgSgr.green)
  }
  yellow(): Decorator {
    return this.code(fgSgr.yellow)
  }
  blue(): Decorator {
    return this.code(fgSgr.blue)
  }
  magenta(): Decorator {
    return this.code(fgSgr.magenta)
  }
  cyan(): Decorator {
    return this.code(fgSgr.cyan)
  }
  white(): Decorator {
    return this.code(fgSgr.white)
  }

  /** Restore the terminal's default foreground color. */
  defaultColor(): Decorator {
    return this.code(defaultFgSgr)
  }
  brightBlack(): Decorator {
    return this.code(brightFgSgr.black)
  }
  /** Alias of `brightBlack`, the name a reader usually expects. */
  gray(): Decorator {
    return this.code(brightFgSgr.black)
  }
  brightRed(): Decorator {
    return this.code(brightFgSgr.red)
  }
  brightGreen(): Decorator {
    return this.code(brightFgSgr.green)
  }
  brightYellow(): Decorator {
    return this.code(brightFgSgr.yellow)
  }
  brightBlue(): Decorator {
    return this.code(brightFgSgr.blue)
  }
  brightMagenta(): Decorator {
    return this.code(brightFgSgr.magenta)
  }
  brightCyan(): Decorator {
    return this.code(brightFgSgr.cyan)
  }
  brightWhite(): Decorator {
    return this.code(brightFgSgr.white)
  }

  bgBlack(): Decorator {
    return this.code(bgSgr.black)
  }
  bgRed(): Decorator {
    return this.code(bgSgr.red)
  }
  bgGreen(): Decorator {
    return this.code(bgSgr.green)
  }
  bgYellow(): Decorator {
    return this.code(bgSgr.yellow)
  }
  bgBlue(): Decorator {
    return this.code(bgSgr.blue)
  }
  bgMagenta(): Decorator {
    return this.code(bgSgr.magenta)
  }
  bgCyan(): Decorator {
    return this.code(bgSgr.cyan)
  }
  bgWhite(): Decorator {
    return this.code(bgSgr.white)
  }

  /** Restore the terminal's default background color. */
  bgDefault(): Decorator {
    return this.code(defaultBgSgr)
  }
  bgBrightBlack(): Decorator {
    return this.code(brightBgSgr.black)
  }
  bgBrightRed(): Decorator {
    return this.code(brightBgSgr.red)
  }
  bgBrightGreen(): Decorator {
    return this.code(brightBgSgr.green)
  }
  bgBrightYellow(): Decorator {
    return this.code(brightBgSgr.yellow)
  }
  bgBrightBlue(): Decorator {
    return this.code(brightBgSgr.blue)
  }
  bgBrightMagenta(): Decorator {
    return this.code(brightBgSgr.magenta)
  }
  bgBrightCyan(): Decorator {
    return this.code(brightBgSgr.cyan)
  }
  bgBrightWhite(): Decorator {
    return this.code(brightBgSgr.white)
  }

  /**
   * Set a 256-code foreground color.
   *
   * ## Throws
   *
   * - Throws a `RangeError` when `code` is not an integer in `0..255`.
   */
  fg256(code: number): Decorator {
    return this.code(...fg256Sgr(code))
  }

  /**
   * Set a 256-code background color.
   *
   * ## Throws
   *
   * - Throws a `RangeError` when `code` is not an integer in `0..255`.
   */
  bg256(code: number): Decorator {
    return this.code(...bg256Sgr(code))
  }

  /**
   * Set an rgb foreground color.
   *
   * ## Throws
   *
   * - Throws a `RangeError` when a channel is not an integer in `0..255`.
   */
  rgb(red: number, green: number, blue: number): Decorator {
    return this.code(...fgRgbSgr(red, green, blue))
  }

  /**
   * Set an rgb background color.
   *
   * ## Throws
   *
   * - Throws a `RangeError` when a channel is not an integer in `0..255`.
   */
  bgRgb(red: number, green: number, blue: number): Decorator {
    return this.code(...bgRgbSgr(red, green, blue))
  }
}

/**
 * Decorate a text, so `decorate(text)` means `new Decorator(text)`.
 */
export function decorate(text: string): Decorator {
  return new Decorator(text)
}
