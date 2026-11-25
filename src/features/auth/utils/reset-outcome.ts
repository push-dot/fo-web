import { ApiError } from '@push/api-client'

export const requestOutcome = (caught: unknown) => {
  if (caught === null) return 'sent'
  return caught instanceof ApiError && caught.status === 429 ? 'limit' : 'failed'
}

export const linkOutcome = (
  caught: unknown,
): { view: 'form' } | { view: 'expired'; email: string } | { view: 'invalid' } => {
  if (!(caught instanceof ApiError)) return { view: 'form' }
  if (caught.code === 'TOKEN_EXPIRED')
    return { view: 'expired', email: String(caught.details?.email ?? '') }
  if (caught.status === 401) return { view: 'invalid' }
  return { view: 'form' }
}
