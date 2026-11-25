import type { ConversationListItem } from '@push/api-client'
import { Link } from 'react-router-dom'
import { relativeTime } from '../../../shared/lib/format'
import { queueAhead } from '../utils/chat-copy'
import { CHAT_NEW } from '../constants'
import { chatListMark } from '../utils/chat-list-mark'

const ChatRoomRow = ({
  conversation,
  active,
}: {
  conversation: ConversationListItem
  active: boolean
}) => {
  const mark = chatListMark(conversation.status)
  const author = conversation.createdBy.displayName
  const queued =
    conversation.queuePosition !== null && conversation.queuePosition > 0
      ? queueAhead(conversation.queuePosition)
      : ''
  const meta = [author, queued].filter(Boolean).join(' · ')
  return (
    <Link
      className={active ? 'chat-link on' : 'chat-link'}
      aria-current={active ? 'page' : undefined}
      to={`/employer/chat/${conversation.id}`}
    >
      <span className="chat-link-title">
        <span className="b2 w7 cap">{conversation.title || CHAT_NEW}</span>
        {mark ? <span className={`badge ${mark.tone}`}>{mark.label}</span> : null}
        <span className="c1 t3">{relativeTime(conversation.updatedAt)}</span>
      </span>
      {meta ? <span className="c1 t3 cap">{meta}</span> : null}
      {conversation.lastLine ? <span className="c1 t3 cap">{conversation.lastLine}</span> : null}
    </Link>
  )
}

export default ChatRoomRow
