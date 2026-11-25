import type { ConversationTurn, Message } from '@push/api-client'
import { storedTurn, type ChatTurn } from './chat-turn'

const storedCache = new WeakMap<ConversationTurn, ReturnType<typeof storedTurn>>()
const storedOnce = (turn: ConversationTurn) => {
  const known = storedCache.get(turn)
  if (known) return known
  const made = storedTurn(turn)
  storedCache.set(turn, made)
  return made
}

export type Attachment = Message['attachments'][number]

export type LiveTurn = {
  text: string
  attachments: Attachment[]
  turn: ChatTurn | null
  known: string[]
  jobId?: string
}

export type ThreadItem =
  | { kind: 'user'; key: string; text: string; attachments: Attachment[] }
  | { kind: 'turn'; key: string; turn: ChatTurn; live: boolean }
  | { kind: 'reply'; key: string; text: string }

export const threadItems = (
  messages: Message[],
  turns: ConversationTurn[],
  live: LiveTurn | null,
): ThreadItem[] => {
  const known = live && new Set(live.known)
  const jobs = live?.jobId ? turns.filter((turn) => turn.jobId !== live.jobId) : turns
  const rows = [...messages].reverse().filter((message) => !known || known.has(message.id))
  const shown = new Set<string>()
  const replay = (turn: ConversationTurn): ThreadItem => {
    shown.add(turn.jobId)
    return { kind: 'turn', key: turn.jobId, live: false, ...storedOnce(turn) }
  }
  const items = rows.flatMap((message): ThreadItem[] => {
    if (message.role === 'USER') {
      const own = jobs.find((turn) => turn.userMessageId === message.id && !shown.has(turn.jobId))
      const user: ThreadItem = {
        kind: 'user',
        key: message.id,
        text: message.text,
        attachments: message.attachments,
      }
      return own && !rows.some((row) => row.id === own.assistantMessageId)
        ? [user, replay(own)]
        : [user]
    }
    const stored = jobs.find(
      (turn) => turn.assistantMessageId === message.id && !shown.has(turn.jobId),
    )
    return [stored ? replay(stored) : { kind: 'reply', key: message.id, text: message.text }]
  })
  if (!live) return items
  return [
    ...items,
    ...(live.text
      ? [
          {
            kind: 'user' as const,
            key: 'live-user',
            text: live.text,
            attachments: live.attachments,
          },
        ]
      : []),
    ...(live.turn
      ? [{ kind: 'turn' as const, key: 'live-turn', turn: live.turn, live: true }]
      : []),
  ]
}

export const applicationTrail = (
  items: ThreadItem[],
): { before: (string | undefined)[]; last: string | undefined } => {
  let last: string | undefined
  const before = items.map((item) => {
    const seen = last
    if (item.kind === 'user')
      for (const attachment of item.attachments) if (attachment.type === 'APPLICATION') last = attachment.id
    return seen
  })
  return { before, last }
}
