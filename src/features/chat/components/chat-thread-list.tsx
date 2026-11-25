import { LegendList, type LegendListRef } from '@legendapp/list/react'
import { memo, useCallback, useEffect, useRef, useSyncExternalStore, type ReactNode } from 'react'

import type { LiveTurnStore } from '../stores'
import type { ThreadItem } from '../utils/chat-thread'
import ChatAnswer from './chat-answer'
import ChatTurnView from './chat-turn-view'
import ChatUser from './chat-user'

type TurnItem = Extract<ThreadItem, { kind: 'turn' }>

type TurnRowProps = { item: TurnItem; applicationId?: string }

const TurnRow = memo(
  ({ item, applicationId }: TurnRowProps) => <ChatTurnView item={item} applicationId={applicationId} />,
  (prev, next) =>
    prev.item.turn === next.item.turn && prev.applicationId === next.applicationId,
)

const LiveRow = ({ item, store, applicationId }: TurnRowProps & { store: LiveTurnStore }) => {
  const turn = useSyncExternalStore(store.subscribe, store.turn)
  return <ChatTurnView item={turn ? { ...item, turn } : item} applicationId={applicationId} />
}

const UserRow = memo(ChatUser)
const ReplyRow = memo(ChatAnswer)

type Props = {
  items: ThreadItem[]
  before: (string | undefined)[]
  store: LiveTurnStore
  listKey: string | undefined
  pin: number
  onStartReached: () => void
  header?: ReactNode
  footer?: ReactNode
}

const ChatThreadList = ({ items, before, store, listKey, pin, onStartReached, header, footer }: Props) => {
  const list = useRef<LegendListRef>(null)
  useEffect(() => {
    if (!pin) return
    const frame = requestAnimationFrame(() => void list.current?.scrollToEnd({ animated: false }))
    return () => cancelAnimationFrame(frame)
  }, [pin])

  const renderItem = useCallback(
    ({ item, index }: { item: ThreadItem; index: number }) => {
      const applicationId = before[index]
      return (
        <div className="chat-row">
          {item.kind === 'user' ? (
            <UserRow text={item.text} attachments={item.attachments} />
          ) : item.kind === 'reply' ? (
            <ReplyRow text={item.text} live={false} after="start" />
          ) : item.live ? (
            <LiveRow item={item} store={store} applicationId={applicationId} />
          ) : (
            <TurnRow item={item} applicationId={applicationId} />
          )}
        </div>
      )
    },
    [before, store],
  )

  return (
    <LegendList
      ref={list}
      className="chat-list"
      data={items}
      dataKey={listKey}
      renderItem={renderItem}
      keyExtractor={(item) => item.key}
      estimatedItemSize={120}
      alignItemsAtEnd
      initialScrollAtEnd
      maintainScrollAtEnd
      maintainVisibleContentPosition
      onStartReached={onStartReached}
      recycleItems={false}
      ListHeaderComponent={<div className="chat-row chat-row-head">{header}</div>}
      ListFooterComponent={<div className="chat-row chat-row-foot">{footer}</div>}
    />
  )
}

export default ChatThreadList
