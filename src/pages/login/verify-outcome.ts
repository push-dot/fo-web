import { ApiError } from '@push/api-client'

import { linkOutcome } from './reset-outcome'

// POST auth/email/verify. 410 TOKEN_EXPIRED carries the signup email; an unknown or used link is 401, and 409
// EMAIL_TAKEN means the account already exists, so the link is spent either way. A 400 on the password leaves the
// link usable, so the form stays.
export const verifyOutcome = (
  caught: unknown,
): { view: 'form'; field: 'password' | 'form' } | { view: 'expired'; email: string } | { view: 'invalid' } => {
  const link = linkOutcome(caught)
  if (link.view !== 'form') return link
  if (!(caught instanceof ApiError)) return { view: 'form', field: 'form' }
  if (caught.status === 409) return { view: 'invalid' }
  return { view: 'form', field: caught.details?.field === 'password' ? 'password' : 'form' }
}
