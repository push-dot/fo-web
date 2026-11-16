import { absoluteUrl, createApi, createClient, type Session } from '@push/api-client'
import { cookieFetch, cookieSession, refreshFromCookie } from '../auth/cookie-session'
import { readAccessToken, sessionStore } from '../auth/session'
import { accessToken } from '../auth/token-source'
import { isMock, isWebView, pushEnv } from '../lib/bridge'
import { loadMock } from './mock-loader'

export const apiBaseUrl =
  pushEnv().apiBaseUrl ?? import.meta.env.VITE_API_BASE_URL ?? 'https://push-be.youngjoon568.workers.dev/api/v1'
const mockTransport = isMock()

const mockFetch: typeof fetch = (input, init) => loadMock().then((mock) => mock.mockFetch(input, init))

export const assetUrl = (url: string | null | undefined) => absoluteUrl(url, apiBaseUrl) ?? undefined

let refreshInFlight: Promise<boolean> | null = null

const refreshUrl = () => `${apiBaseUrl.replace(/\/+$/, '')}/auth/refresh`

// A visitor with no session has nothing to clear, and clearing would also drop the sign-up return path
// saved for a verify link opened in a new tab.
const dropSession = () => {
  if (sessionStore.load()) sessionStore.clear()
}

const refreshFromCookieOnce = async () => {
  try {
    const session = await refreshFromCookie(refreshUrl(), (input, init) => fetch(input, init))
    if (session) sessionStore.save(session)
    else dropSession()
    return session !== null
  } catch {
    dropSession()
    return false
  }
}

const refreshOnce = async () => {
  if (cookieSession) return refreshFromCookieOnce()
  const current = sessionStore.load()
  if (!current?.refreshToken) {
    sessionStore.clear()
    return false
  }
  try {
    const transport = mockTransport ? mockFetch : fetch
    const response = await transport(refreshUrl(), {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: current.refreshToken }),
    })
    if (!response.ok) {
      sessionStore.clear()
      return false
    }
    const body = (await response.json()) as { data?: Session }
    if (!body.data?.accessToken) {
      sessionStore.clear()
      return false
    }
    sessionStore.save(body.data)
    return true
  } catch {
    sessionStore.clear()
    return false
  }
}

const refreshSession = () => {
  if (isWebView()) return Promise.resolve(false)
  refreshInFlight ??= refreshOnce().finally(() => {
    refreshInFlight = null
  })
  return refreshInFlight
}

/** A reload keeps no token in memory, so a web session kept in the cookie is asked back before the first screen. */
export const restoreSession = async () => {
  if (cookieSession && !sessionStore.load()) await refreshSession()
}

export const http = createClient({
  baseUrl: apiBaseUrl,
  getToken: () => accessToken({ webView: isWebView(), injected: pushEnv().token, session: readAccessToken() }),
  refresh: refreshSession,
  fetch: mockTransport ? mockFetch : cookieSession ? cookieFetch((input, init) => fetch(input, init)) : undefined,
})

export const api = createApi(http)
