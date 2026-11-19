import {
  conversationsAttach,
  conversationsCancel,
  conversationsCreateEmployer,
  conversationsFollow,
  conversationsResolveApproval,
  conversationsStream,
} from '../../shared/api/operations'
import type { TurnDeps } from './chat-turn'

export { conversationsAttach, conversationsCreateEmployer }

export const chatTurnDeps: TurnDeps = {
  stream: conversationsStream,
  follow: conversationsFollow,
  resolve: conversationsResolveApproval,
  cancel: conversationsCancel,
}
