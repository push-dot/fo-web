/** The JobDetail boards put a trailing parenthetical on its own line (`백엔드 엔지니어` / `(Kotlin·Spring)`). */
export const postingTitleLines = (title: string): string[] => {
  const at = title.indexOf(' (')
  return at > 0 ? [title.slice(0, at), title.slice(at + 1)] : [title]
}

/**
 * Splits a title line around U+00B7 so the dot can sit in its own box (`.mid-dot`).
 * WebKit advances the dot 10 px at 26 px where the boards (Chrome) advance 15.6 px; a font-face cannot change that,
 * only a box of fixed width does.
 */
export const splitMiddleDot = (line: string): string[] => line.split(/(·)/).filter(Boolean)
