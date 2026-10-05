/**
 * The sgr parameter of each text style, keyed by its ansi name.
 *
 * The name follows ECMA-48, so a caller reaches a style by the term the
 * standard uses rather than a private synonym.
 */
export const styleSgr = {
  bold: 1,
  faint: 2,
  italic: 3,
  underline: 4,
  blink: 5,
  rapidBlink: 6,
  reverse: 7,
  conceal: 8,
  crossedOut: 9,
  fraktur: 20,
  doubleUnderline: 21,
  normalIntensity: 22,
  notItalic: 23,
  notUnderlined: 24,
  notBlinking: 25,
  notReversed: 27,
  reveal: 28,
  notCrossedOut: 29,
  framed: 51,
  encircled: 52,
  overlined: 53,
  notFramed: 54,
  notOverlined: 55,
  superscript: 73,
  subscript: 74,
  notSuperSubscript: 75,
} as const

/** The name of a text style in `styleSgr`. */
export type StyleName = keyof typeof styleSgr
