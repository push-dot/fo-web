import { needsTerms, type Session } from '@push/api-client'

import { meConsents } from '../../entities/session'

export const termsPending = async (session: Session, read: typeof meConsents = meConsents) =>
  needsTerms(await read(session.accessToken))

export type TermsOutcome = 'ready' | 'pending' | 'blocked'

export const termsOutcome = async (
  session: Session,
  read: typeof meConsents = meConsents,
): Promise<TermsOutcome> => {
  try {
    return (await termsPending(session, read)) ? 'pending' : 'ready'
  } catch {
    return 'blocked'
  }
}
