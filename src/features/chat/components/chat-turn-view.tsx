import { Link } from 'react-router-dom'
import { answerParts, questionsText } from '../utils/answer-text'
import type { ThreadItem } from '../utils/chat-thread'
import type { TurnBlock } from '../utils/chat-turn'
import { SurfaceView } from '../../../shared/a2ui'
import Icon from '../../../shared/ui/icon'
import { useChatActions } from '../hooks'
import ChatAnswer from './chat-answer'
import ChatDraftCard from './chat-draft-card'
import ChatQueueCard from './chat-queue-card'
import ChatToolRow from './chat-tool-row'
import { COPY, INTERVIEW_ASK, INTERVIEW_MAKE, OPEN_APPLICANT, SAVE_PDF, TURN_ENDED, TURN_FAILED_HINT, WRITING } from '../utils/chat-copy'

type TurnItem = Extract<ThreadItem, { kind: 'turn' }>
type SurfaceBlock = Extract<TurnBlock, { kind: 'surface' }>

const isPlan = (block: TurnBlock | undefined) => block?.kind === 'surface' && block.card === 'plan'

const ChatSurface = ({ block }: { block: SurfaceBlock }) => {
  const { surfaces, waiting, busy } = useChatActions()
  if (!surfaces) return null
  return (
    <SurfaceView
      host={surfaces}
      surfaceId={block.surfaceId}
      messages={block.messages}
      answerable={!busy && block.surfaceId === waiting}
    />
  )
}

const draftOf = (block: TurnBlock | undefined) =>
  block?.kind === 'tool' && block.draft ? (
    <ChatDraftCard draft={block.draft} postingId={block.postingId} />
  ) : undefined

type BlockProps = {
  block: TurnBlock
  previous: TurnBlock | undefined
  next: TurnBlock | undefined
  live: boolean
}

const Block = ({ block, previous, next, live }: BlockProps) => {
  switch (block.kind) {
    case 'text':
      return (
        <ChatAnswer
          text={block.text}
          live={live}
          after={isPlan(previous) ? 'plan' : 'start'}
          insert={draftOf(previous)}
        />
      )
    case 'tool':
      return (
        <>
          <ChatToolRow tool={block} />
          {next?.kind === 'text' ? null : draftOf(block)}
        </>
      )
    case 'surface':
      return <ChatSurface block={block} />
  }
}

const ChatTurnView = ({ item, applicationId }: { item: TurnItem; applicationId?: string }) => {
  const actions = useChatActions()
  const { blocks, queued, ended } = item.turn
  const running = item.live && actions.busy
  const last = blocks.at(-1)
  const questions = blocks
    .flatMap((block) => (block.kind === 'text' ? answerParts(block.text) : []))
    .flatMap((part) => (part.kind === 'questions' ? part.items : []))
  const person = actions.people.find((entry) => entry.applicationId === applicationId)
  const copy = () => {
    void navigator.clipboard
      ?.writeText(questionsText(questions))
      .then(actions.copied, () => undefined)
  }
  return (
    <>
      {blocks.map((block, index) => (
        <Block
          key={block.key}
          block={block}
          previous={blocks[index - 1]}
          next={blocks[index + 1]}
          live={running && index === blocks.length - 1}
        />
      ))}
      {queued !== null && running ? <ChatQueueCard ahead={queued} /> : null}
      {ended && !blocks.some((block) => block.kind === 'tool' && block.state === 'stop') ? (
        <p className="c1 t3 chat-note">
          {TURN_ENDED[ended]}
          {ended === 'failed' ? (
            <>
              <br />
              {TURN_FAILED_HINT}
            </>
          ) : null}
        </p>
      ) : null}
      {running && last?.kind === 'text' ? (
        <span className="c1 t3 chat-writing">
          <span className="chat-spin sm" aria-hidden="true" />
          {WRITING}
        </span>
      ) : null}
      {!running && blocks.some(isPlan) ? (
        <div className="chat-follow">
          <button
            type="button"
            className="chip"
            disabled={actions.busy}
            onClick={() => actions.send(INTERVIEW_ASK, 'interview')}
          >
            <Icon name="spark" size={16} />
            {INTERVIEW_MAKE}
          </button>
          {person ? (
            <Link
              className="chip"
              to={`/employer/postings/${person.postingId}/applicants/${person.applicationId}`}
            >
              {OPEN_APPLICANT}
            </Link>
          ) : null}
        </div>
      ) : null}
      {!running && questions.length > 0 ? (
        <div className="chat-follow">
          <button type="button" className="chip" onClick={copy}>
            <Icon name="copy" size={16} />
            {COPY}
          </button>
          <button type="button" className="chip" onClick={() => window.print()}>
            <Icon name="doc" size={16} />
            {SAVE_PDF}
          </button>
        </div>
      ) : null}
    </>
  )
}

export default ChatTurnView
