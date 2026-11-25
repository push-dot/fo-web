export const memberInitials = (name: string) => {
  const chars = [...name.trim()]
  return /^[가-힣]{3,}$/.test(name.trim())
    ? chars.slice(-2).join('')
    : (chars[0] ?? '').toUpperCase()
}
