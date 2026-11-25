import type { ConversationListItem } from '@push/api-client'
import { LegendList } from '@legendapp/list/react'
import { Link } from 'react-router-dom'
import Icon from '../../../shared/ui/icon'
import { CHAT_BUY, usedText } from '../utils/chat-copy'
import type { ChatUsage } from '../types'
import { CHAT_EMPTY, CHAT_FAILED, CHAT_LOADING, CHAT_NEW, CHAT_SHARED } from '../constants'
import UsageMeter from './usage-meter'
import ChatRoomRow from './chat-room-row'

const RoomGap = () => <div style={{ height: 4 }} />

const ChatSide = ({
  conversations,
  activeId,
  loading,
  failed,
  usage,
}: {
  conversations: ConversationListItem[]
  activeId?: string
  loading: boolean
  failed: boolean
  usage: ChatUsage | null
}) => (
  <aside className="chat-side">
    <Link className="btn pri chat-new" to="/employer/chat/new">
      <Icon name="plus" size={18} width={2.4} />
      {CHAT_NEW}
    </Link>
    <p className="c1 w7 t3 chat-shared">{CHAT_SHARED}</p>
    {failed ? (
      <p className="b2 chat-side-note" role="alert">
        {CHAT_FAILED}
      </p>
    ) : null}
    {loading ? <p className="c1 t3 chat-side-note">{CHAT_LOADING}</p> : null}
    {!loading && !failed && conversations.length === 0 ? (
      <p className="c1 t3 chat-side-note">{CHAT_EMPTY}</p>
    ) : null}
    <nav className="chat-rooms">
      <LegendList
        className="chat-rooms-list"
        data={conversations}
        extraData={activeId}
        keyExtractor={(conversation) => conversation.id}
        estimatedItemSize={72}
        recycleItems
        ItemSeparatorComponent={RoomGap}
        renderItem={({ item }) => <ChatRoomRow conversation={item} active={item.id === activeId} />}
      />
    </nav>
    {usage ? (
      <div className="chat-usage">
        <span className="c1 chat-usage-line">
          <span className="w7">{usage.plan}</span>
          <span className="t3">{usedText(usage.percent)}</span>
        </span>
        <UsageMeter usage={usage} className="chat-meter" />
        {usage.topup ? (
          <Link className="c1 w7" to="/employer/plans">
            {CHAT_BUY}
          </Link>
        ) : null}
      </div>
    ) : null}
  </aside>
)

export default ChatSide
