import { ApiError } from '@push/api-client'
import type { ChatIntent } from './employer-chat'
import { HTTP_TOO_MANY_REQUESTS } from '../constants'

export type ChatBlock = 'interview' | 'pdf' | 'verify' | 'credits' | 'busy' | 'failed'

export const isChatIntent = (value: unknown): value is ChatIntent =>
  value === 'posting' || value === 'review' || value === 'interview' || value === 'general'

export const chatGateFrom = (error: unknown): ChatBlock => {
  if (error instanceof ApiError && error.code === 'BUSINESS_NOT_VERIFIED') return 'verify'
  if (error instanceof ApiError && (error.code === 'INSUFFICIENT_CREDITS' || error.code === 'FEATURE_DISABLED')) return 'credits'
  if (error instanceof ApiError && error.status === HTTP_TOO_MANY_REQUESTS) return 'busy'
  if (error instanceof ApiError && error.code === 'PLAN_REQUIRED' && error.details?.requiredPlan === 'ULTRA') return 'pdf'
  if (error instanceof ApiError && error.code === 'PLAN_REQUIRED' && error.details?.requiredPlan === 'PRO') return 'interview'
  return 'failed'
}

const KEPT_CODES = ['INTERNAL', 'NOT_CONFIGURED']

export const acceptedFailure = (error: unknown): 'dropped' | 'kept' | null => {
  if (!(error instanceof ApiError) || error.code === 'NETWORK_ERROR' || error.code === 'STREAM_PARSE') return 'dropped'
  return error.status === 0 && KEPT_CODES.includes(error.code) ? 'kept' : null
}

export const questionForComposer = (
  error: unknown,
  question: string,
  messages: { id: string; role: string; text: string }[],
  known: readonly string[],
) => {
  if (acceptedFailure(error) !== 'kept') return null
  const seen = new Set(known)
  const kept = messages.some((message) => !seen.has(message.id) && message.role === 'USER' && message.text === question)
  return kept ? null : question
}

export const composerAfterVanish = (current: string, question: string | null) =>
  question !== null && current === '' ? question : current

export type ApprovalFailure = 'resolved' | 'expired' | 'failed'

export const approvalFailureFrom = (error: unknown): ApprovalFailure => {
  if (error instanceof ApiError && error.code === 'APPROVAL_ALREADY_RESOLVED') return 'resolved'
  if (error instanceof ApiError && error.code === 'APPROVAL_EXPIRED') return 'expired'
  return 'failed'
}

export const chatRouteState = (value: unknown) => {
  const record =
    value && typeof value === 'object'
      ? (value as { intent?: unknown; postingId?: unknown; applicationId?: unknown; text?: unknown })
      : {}
  const text = (field: unknown) => (typeof field === 'string' && field ? field : undefined)
  return {
    intent: isChatIntent(record.intent) ? record.intent : ('general' as const),
    postingId: text(record.postingId),
    applicationId: text(record.applicationId),
    text: text(record.text),
  }
}
