import { absoluteUrl, ApiError, createApi, createClient, createRefresher, type RefresherConfig, type Session } from '@push/api-client'
import { A2UI_VERSION } from '../a2ui/version'
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

const refreshUrl = () => `${apiBaseUrl.replace(/\/+$/, '')}/auth/refresh`

const isAuthFailure = (error: unknown) => error instanceof ApiError && (error.status === 401 || error.status === 403)

const refreshWithToken = async (refreshToken: string): Promise<Session> => {
  const transport = mockTransport ? mockFetch : fetch
  const response = await transport(refreshUrl(), {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
  if (!response.ok) throw new ApiError('refresh failed', 'HTTP_ERROR', response.status)
  const body = (await response.json().catch(() => ({}))) as { data?: Session }
  if (!body.data?.accessToken) throw new ApiError('invalid refresh response', 'INVALID_REFRESH_TOKEN', 401)
  return body.data
}

const refreshStored = async (current: Session | null): Promise<Session> => {
  if (cookieSession) {
    const session = await refreshFromCookie(refreshUrl(), (input, init) => fetch(input, init))
    if (!session) throw new ApiError('no cookie session', 'UNAUTHENTICATED', 401)
    return session
  }
  if (!current?.refreshToken) throw new ApiError('no refresh token', 'UNAUTHENTICATED', 401)
  return refreshWithToken(current.refreshToken)
}

const refreshLock: RefresherConfig['lock'] =
  typeof navigator !== 'undefined' && navigator.locks
    ? (run) => navigator.locks.request('push-refresh', run)
    : undefined

const refresh = createRefresher({
  refresh: refreshStored,
  load: sessionStore.load,
  save: sessionStore.save,
  clear: () => {
    if (sessionStore.load()) sessionStore.clear()
  },
  isAuthFailure,
  lock: refreshLock,
})

const refreshSession = () => (isWebView() ? Promise.resolve(false) : refresh())

export const restoreSession = async () => {
  if (cookieSession && !sessionStore.load()) await refreshSession()
}

export const http = createClient({
  baseUrl: apiBaseUrl,
  a2uiVersion: A2UI_VERSION,
  getToken: () => accessToken({ webView: isWebView(), injected: pushEnv().token, session: readAccessToken() }),
  refresh: refreshSession,
  fetch: mockTransport ? mockFetch : cookieSession ? cookieFetch((input, init) => fetch(input, init)) : undefined,
})

export const api = createApi(http)
