import {
  conversationsList as fetchConversations,
  conversationsMessages as fetchMessages,
  conversationsTurns as fetchTurns,
  conversationsAttach,
  conversationsCancel,
  conversationsCreateEmployer,
  conversationsFollow,
  conversationsResolveApproval,
  conversationsStream,
} from '../../../shared/api/operations'
import type { TurnDeps } from '../utils/chat-turn'

export const conversationsList = (...args: Parameters<typeof fetchConversations>) =>
  fetchConversations(...args)

export const conversationsMessages = (...args: Parameters<typeof fetchMessages>) =>
  fetchMessages(...args)

export const conversationsTurns = (...args: Parameters<typeof fetchTurns>) => fetchTurns(...args)

export { conversationsAttach, conversationsCreateEmployer }

export const chatTurnDeps: TurnDeps = {
  stream: conversationsStream,
  follow: conversationsFollow,
  resolve: conversationsResolveApproval,
  cancel: conversationsCancel,
}
