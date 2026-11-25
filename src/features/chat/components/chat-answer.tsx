import { Fragment, type ReactNode } from 'react'
import { answerParts } from '../utils/answer-text'
import ChatDraftCard from './chat-draft-card'
import ChatQuestions from './chat-questions'
import ChatSay from './chat-say'

type ChatAnswerProps = { text: string; live: boolean; after: 'start' | 'plan'; insert?: ReactNode }

const ChatAnswer = ({ text, live, after, insert }: ChatAnswerProps) => {
  const parts = answerParts(text)
  return (
    <>
      {parts.map((part, index) => {
        const last = index === parts.length - 1
        const body =
          part.kind === 'questions' ? (
            <ChatQuestions items={part.items} caret={live && last} />
          ) : part.kind === 'draft' ? (
            <ChatDraftCard draft={part.draft} />
          ) : after === 'plan' && index === 0 ? (
            <p className="c1 t3 chat-note">{part.text}</p>
          ) : (
            <ChatSay text={part.text} soft={Boolean(insert) && index > 0} />
          )
        return (
          <Fragment key={index}>
            {body}
            {index === 0 ? insert : null}
          </Fragment>
        )
      })}
      {parts.length === 0 ? insert : null}
    </>
  )
}

export default ChatAnswer
