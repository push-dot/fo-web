import { ApiError, type Offer, type OfferMessage } from '@push/api-client'

export type ThreadEntry = { id: string; mine: boolean; body: string; createdAt: string; failed: boolean }

const isFailed = (message: OfferMessage) => (message as OfferMessage & { status?: string }).status === 'FAILED'

export const threadEntries = (offer: Offer, messages: OfferMessage[], viewerId: string | undefined): ThreadEntry[] => [
  { id: `offer-${offer.id}`, mine: offer.sender.id === viewerId, body: offer.message, createdAt: offer.createdAt, failed: false },
  ...messages.map((item) => ({ id: item.id, mine: item.sender.id === viewerId, body: item.body, createdAt: item.createdAt, failed: isFailed(item) })),
]

export const blockedSend = (error: unknown, body: string, now = new Date()): ThreadEntry | null =>
  error instanceof ApiError && error.code === 'BLOCKED'
    ? { id: `blocked-${now.getTime()}`, mine: true, body, createdAt: now.toISOString(), failed: true }
    : null
