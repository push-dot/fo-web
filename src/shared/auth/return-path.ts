import type { Session } from '@push/api-client'
import { browserLocalStorage, browserSessionStorage } from '../lib/storage'
import { employerGate } from '../model/access'
import { sanitizeReturnTo } from '../model/return-to'
import { AUTH_ENTRY_PATHS, RETURN_TO_KEY, SIGNUP_RETURN_TO_KEY, VERIFY_LINK_MS } from './constants'

const authEntries = new Set<string>(AUTH_ENTRY_PATHS)

export const saveReturnTo = (value: string) => {
  browserSessionStorage()?.setItem(RETURN_TO_KEY, sanitizeReturnTo(value))
}

export const takeReturnTo = () => {
  const storage = browserSessionStorage()
  const stored = storage?.getItem(RETURN_TO_KEY) ?? null
  storage?.removeItem(RETURN_TO_KEY)
  return sanitizeReturnTo(stored)
}

export const saveSignupReturnTo = (value: string, email: string, now = Date.now()) => {
  saveReturnTo(value)
  browserLocalStorage()?.setItem(
    SIGNUP_RETURN_TO_KEY,
    JSON.stringify({ path: sanitizeReturnTo(value), email: email.toLowerCase(), until: now + VERIFY_LINK_MS }),
  )
}

export const takeSignupReturnTo = (email: string, now = Date.now()) => {
  const inTab = takeReturnTo()
  const storage = browserLocalStorage()
  const raw = storage?.getItem(SIGNUP_RETURN_TO_KEY) ?? null
  storage?.removeItem(SIGNUP_RETURN_TO_KEY)
  try {
    const saved = JSON.parse(raw ?? 'null') as { path?: unknown; email?: unknown; until?: unknown } | null
    if (
      saved &&
      typeof saved.path === 'string' &&
      typeof saved.until === 'number' &&
      saved.until > now &&
      email !== '' &&
      saved.email === email.toLowerCase()
    )
      return sanitizeReturnTo(saved.path)
  } catch {
  }
  return inTab
}

export const forgetSignupReturnTo = () => {
  browserLocalStorage()?.removeItem(SIGNUP_RETURN_TO_KEY)
}

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
