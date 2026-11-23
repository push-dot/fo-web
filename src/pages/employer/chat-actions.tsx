import { createContext, useContext } from 'react'
import type { SurfaceHost } from '../../shared/a2ui'
import type { ChatIntent } from '../../shared/model/employer-chat'

export type ChatPerson = {
  applicationId: string
  name: string
  postingId: string
  postingTitle: string
}

export type ChatActions = {
  busy: boolean
  /** The Bot surfaces of the screen; null outside a chat room. */
  surfaces: SurfaceHost | null
  /** The newest waiting surface: the only one that takes input. */
  waiting: string | undefined
  people: ChatPerson[]
  send: (text: string, intent?: ChatIntent) => void
  focus: () => void
  redraft: () => void
  copied: () => void
}

const idle: ChatActions = {
  busy: true,
  surfaces: null,
  waiting: undefined,
  people: [],
  send: () => undefined,
  focus: () => undefined,
  redraft: () => undefined,
  copied: () => undefined,
}

export const ChatActionsContext = createContext<ChatActions>(idle)

export const useChatActions = () => useContext(ChatActionsContext)
