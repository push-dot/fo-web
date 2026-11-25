import type { Session } from '@push/api-client'
import { AUTH_ENTRY_PATHS } from '../../../shared/auth/constants'
import { sanitizeReturnTo } from '../../../shared/auth/return-to'
import { employerGate } from './access'

const authEntries = new Set<string>(AUTH_ENTRY_PATHS)

export const gateAccount = (session: Session | null) => {
  const accountType = session?.user.accountType
  if (!session || !accountType) return null
  return {
    accountType,
    verified: accountType === 'EMPLOYER' && Boolean(session.user.companyId),
  }
}

export const pathAfterAuth = (target: string, session: Session) => {
  const safe = sanitizeReturnTo(target)
  const pathname = safe.split('?')[0] ?? '/'
  if (authEntries.has(pathname)) return '/'
  const gate = employerGate(pathname, gateAccount(session))
  if (gate === 'verify') return '/employer/verify'
  if (gate === 'login') return '/'
  return safe
}
