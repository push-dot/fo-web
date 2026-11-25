import { matchHangul } from '@push/shared'

const Highlight = ({ text, query }: { text: string; query: string }) => {
  const match = matchHangul(text, query)
  if (!match) return text
  return (
    <>
      {text.slice(0, match.start)}
      <mark>{text.slice(match.start, match.end)}</mark>
      {text.slice(match.end)}
    </>
  )
}

export default Highlight
