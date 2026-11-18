/** The JobDetail boards put a trailing parenthetical on its own line (`백엔드 엔지니어` / `(Kotlin·Spring)`). */
export const postingTitleLines = (title: string): string[] => {
  const at = title.indexOf(' (')
  return at > 0 ? [title.slice(0, at), title.slice(at + 1)] : [title]
}
