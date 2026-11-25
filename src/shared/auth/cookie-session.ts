import { ApiError, type Session } from '@push/api-client'

import { isMock, isWebView } from '../lib/bridge'

export const cookieSessionOn = (flag: unknown, notWeb: boolean) => flag === '1' && !notWeb

export const cookieSession = cookieSessionOn(import.meta.env.VITE_COOKIE_SESSION, isMock() || isWebView())

export const CSRF_HEADER = 'x-csrf'

const addressOf = (input: RequestInfo | URL) =>
  typeof input === 'string' ? input : input instanceof URL ? input.href : input.url

export const cookieFetch =
  (transport: typeof fetch): typeof fetch =>
  (input, init) => {
    if (!new URL(addressOf(input), 'http://localhost').pathname.includes('/auth/')) return transport(input, init)
    const request = new Request(input, { ...init, credentials: 'include' })
    request.headers.set(CSRF_HEADER, '1')
    return transport(request)
  }

export const refreshFromCookie = async (url: string, transport: typeof fetch): Promise<Session | null> => {
  const response = await cookieFetch(transport)(url, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: '{}',
  })
  if (response.status === 401 || response.status === 403) return null
  if (!response.ok) throw new ApiError('refresh failed', 'HTTP_ERROR', response.status)
  const body = (await response.json()) as { data?: Session }
  return body.data?.accessToken ? body.data : null
}
