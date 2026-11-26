import type { SurfaceHost } from '../../shared/a2ui'
import type { ChatIntent } from './utils/employer-chat'

export type ChatPerson = {
  applicationId: string
  name: string
  postingId: string
  postingTitle: string
}

export type ChatActions = {
  busy: boolean
  surfaces: SurfaceHost | null
  waiting: string | undefined
  people: ChatPerson[]
  posting?: { id: string; title: string }
  send: (text: string, intent?: ChatIntent) => void
  focus: () => void
  redraft: () => void
  copied: () => void
}

export type ComposerFile = { name: string; size: number }

export type ChatUsage = { plan: string; percent: number; full: boolean; topup: boolean }
