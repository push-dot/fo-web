import { ApiError } from '@push/api-client'

import { linkOutcome } from './reset-outcome'

export const verifyOutcome = (
  caught: unknown,
): { view: 'form'; field: 'password' | 'form' } | { view: 'expired'; email: string } | { view: 'invalid' } => {
  const link = linkOutcome(caught)
  if (link.view !== 'form') return link
  if (!(caught instanceof ApiError)) return { view: 'form', field: 'form' }
  if (caught.status === 409) return { view: 'invalid' }
  return { view: 'form', field: caught.details?.field === 'password' ? 'password' : 'form' }
}
