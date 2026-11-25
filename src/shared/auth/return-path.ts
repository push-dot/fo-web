import type { Session } from '@push/api-client'
import { browserLocalStorage, browserSessionStorage } from '../lib/storage'
import { sanitizeReturnTo } from './return-to'
import { RETURN_TO_KEY, SIGNUP_RETURN_TO_KEY, VERIFY_LINK_MS } from './constants'

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
