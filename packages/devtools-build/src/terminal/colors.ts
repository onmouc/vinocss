/**
 * The sgr parameter of each foreground color, keyed by its ansi name.
 *
 * The names are the eight basic colors the ansi standard defines.
 */
export const fgSgr = {
  black: 30,
  red: 31,
  green: 32,
  yellow: 33,
  blue: 34,
  magenta: 35,
  cyan: 36,
  white: 37,
} as const

/** The sgr parameter of each background color, keyed by its ansi name. */
export const bgSgr = {
  black: 40,
  red: 41,
  green: 42,
  yellow: 43,
  blue: 44,
  magenta: 45,
  cyan: 46,
  white: 47,
} as const

/** The sgr parameter of each bright foreground color, the aixterm range 90-97. */
export const brightFgSgr = {
  black: 90,
  red: 91,
  green: 92,
  yellow: 93,
  blue: 94,
  magenta: 95,
  cyan: 96,
  white: 97,
} as const

/** The sgr parameter of each bright background color, the aixterm range 100-107. */
export const brightBgSgr = {
  black: 100,
  red: 101,
  green: 102,
  yellow: 103,
  blue: 104,
  magenta: 105,
  cyan: 106,
  white: 107,
} as const

/** The sgr parameter that restores the terminal's default foreground color. */
export const defaultFgSgr = 39

/** The sgr parameter that restores the terminal's default background color. */
export const defaultBgSgr = 49

/** The name of a color in `fgSgr`. */
export type ColorName = keyof typeof fgSgr

/**
 * Build the sgr parameters of a 256-code foreground color, `38;5;code`.
 *
 * ## Throws
 *
 * - Throws a `RangeError` when `code` is not an integer in `0..255`.
 */
export function fg256Sgr(code: number): number[] {
  return [38, 5, byte(code, "code")]
}

/**
 * Build the sgr parameters of a 256-code background color, `48;5;code`.
 *
 * ## Throws
 *
 * - Throws a `RangeError` when `code` is not an integer in `0..255`.
 */
export function bg256Sgr(code: number): number[] {
  return [48, 5, byte(code, "code")]
}

/**
 * Build the sgr parameters of an rgb foreground color, `38;2;red;green;blue`.
 *
 * ## Throws
 *
 * - Throws a `RangeError` when a channel is not an integer in `0..255`.
 */
export function fgRgbSgr(red: number, green: number, blue: number): number[] {
  return [38, 2, byte(red, "red"), byte(green, "green"), byte(blue, "blue")]
}

/**
 * Build the sgr parameters of an rgb background color, `48;2;red;green;blue`.
 *
 * ## Throws
 *
 * - Throws a `RangeError` when a channel is not an integer in `0..255`.
 */
export function bgRgbSgr(red: number, green: number, blue: number): number[] {
  return [48, 2, byte(red, "red"), byte(green, "green"), byte(blue, "blue")]
}

function byte(value: number, name: string): number {
  if (!Number.isInteger(value) || value < 0 || value > 255)
    throw new RangeError(`${name} must be an integer in 0..255, got ${value}`)
  return value
}
