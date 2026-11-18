import { splitDotWords, splitMiddleDot } from '../lib/mid-dot'

const MidDotText = ({ text }: { text: string }) => (
  <>
    {splitDotWords(text).map((word, i) =>
      word.includes('·') ? (
        <span key={i} className="dot-word">
          {splitMiddleDot(word).map((part, j) =>
            part === '·' ? (
              <span key={j} className="mid-dot">
                {part}
              </span>
            ) : (
              part
            ),
          )}
        </span>
      ) : (
        word
      ),
    )}
  </>
)

export default MidDotText
