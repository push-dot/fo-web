import { afterEach, describe, expect, it, vi } from 'vitest'

const store = () => {
  const items = new Map<string, string>()
  return {
    items,
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => void items.set(key, value),
    removeItem: (key: string) => void items.delete(key),
  }
}

const booted = async (answer: Response) => {
  const local = store()
  vi.stubGlobal('localStorage', local)
  const tab = store()
  vi.stubGlobal('sessionStorage', tab)
  vi.stubGlobal('fetch', vi.fn(async () => answer))
  vi.stubEnv('VITE_COOKIE_SESSION', '1')
  vi.resetModules()
  const { saveSignupReturnTo, takeSignupReturnTo } = await import('../auth/return-path')
  const { restoreSession } = await import('./client')
  const { sessionStore } = await import('../auth/session')
  saveSignupReturnTo('/invites/abc', 'kim@push.app')
  tab.items.clear() // the verify link opens in a new tab
  await restoreSession()
  return { sessionStore, takeSignupReturnTo, local }
}

describe('restoreSession in cookie mode', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('leaves a signup return path alone when a visitor has no cookie', async () => {
    const { sessionStore, takeSignupReturnTo } = await booted(new Response('{}', { status: 401 }))

    expect(sessionStore.load()).toBeNull()
    expect(takeSignupReturnTo('kim@push.app')).toBe('/invites/abc')
  })

  it('brings the session back from the cookie, with nothing in localStorage', async () => {
    const session = { accessToken: 'a-1', expiresIn: 900, user: { id: 'u1', displayName: '김', locale: 'ko', accountType: 'EMPLOYER', companyId: null, companyRole: null } }

    const { sessionStore, local } = await booted(new Response(JSON.stringify({ data: session })))

    expect(sessionStore.load()?.accessToken).toBe('a-1')
    expect([...local.items.keys()]).not.toContain('push-session')
    expect([...local.items.values()].join('')).not.toContain('a-1')
  })
})
