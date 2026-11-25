export const dateLabel = (iso: string) => {
  const [, month, day] = iso.slice(0, 10).split('-').map(Number)
  return month && day ? `${month}월 ${day}일` : iso
}
