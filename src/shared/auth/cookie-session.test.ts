import type { Session } from '@push/api-client'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { cookieFetch, cookieSessionOn, CSRF_HEADER, refreshFromCookie } from './cookie-session'

const session: Session = {
  accessToken: 'access-1',
  expiresIn: 900,
  user: { id: 'u1', displayName: '김서준', locale: 'ko', accountType: 'EMPLOYER', companyId: null, companyRole: null },
} as Session

type Call = { url: string; credentials: string; csrf: string | null; body: string }

const recorder = (answer: () => Response) => {
  const calls: Call[] = []
  const transport = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = new Request(input as RequestInfo, init)
    calls.push({ url: request.url, credentials: request.credentials, csrf: request.headers.get(CSRF_HEADER), body: await request.text() })
    return answer()
  }) as typeof fetch
  return { calls, transport }
}

describe('cookie session switch', () => {
  it('is on only for the flag 1 on the real web app', () => {
    expect(cookieSessionOn('1', false)).toBe(true)
    expect(cookieSessionOn('1', true)).toBe(false)
    for (const flag of [undefined, '', '0', 'true']) expect(cookieSessionOn(flag, false)).toBe(false)
  })
})

describe('cookieFetch', () => {
  it('sends auth calls with credentials and the CSRF header, however the request is given', async () => {
    const { calls, transport } = recorder(() => new Response('{}'))
    const send = cookieFetch(transport)

    await send('https://api.example/api/v1/auth/email/login', { method: 'POST', body: '{"a":1}' })
    await send(new Request('https://api.example/api/v1/auth/logout', { method: 'POST', body: '{}' }))

    expect(calls.map((call) => [call.credentials, call.csrf])).toEqual([['include', '1'], ['include', '1']])
    expect(calls[0]!.body).toBe('{"a":1}')
  })

  it('leaves every other call alone', async () => {
    const { calls, transport } = recorder(() => new Response('{}'))

    await cookieFetch(transport)('https://api.example/api/v1/postings')

    expect(calls[0]).toMatchObject({ credentials: 'same-origin', csrf: null })
  })
})

describe('refreshFromCookie', () => {
  it('asks with no token and returns the session the cookie holds', async () => {
    const { calls, transport } = recorder(() => new Response(JSON.stringify({ data: session })))

    await expect(refreshFromCookie('https://api.example/api/v1/auth/refresh', transport)).resolves.toEqual(session)

    expect(calls[0]).toMatchObject({ credentials: 'include', csrf: '1', body: '{}' })
  })

  it('is null when there is no cookie, it expired, or the answer holds no session', async () => {
    for (const answer of [() => new Response('{}', { status: 401 }), () => new Response('{"data":{}}')]) {
      const { transport } = recorder(answer)
      await expect(refreshFromCookie('https://api.example/api/v1/auth/refresh', transport)).resolves.toBeNull()
    }
  })
})

describe('where the session is kept', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  const kept = async (flag: string) => {
    const local = new Map<string, string>()
    const storage = {
      getItem: (key: string) => local.get(key) ?? null,
      setItem: (key: string, value: string) => void local.set(key, value),
      removeItem: (key: string) => void local.delete(key),
    }
    vi.stubGlobal('localStorage', storage)
    vi.stubGlobal('sessionStorage', { ...storage, getItem: () => null })
    vi.stubEnv('VITE_COOKIE_SESSION', flag)
    vi.resetModules()
    const { sessionStore } = await import('./session')
    sessionStore.save({ ...session, refreshToken: 'refresh-1' })
    return { stored: [...local.values()].join(''), loaded: sessionStore.load() }
  }

  it('keeps no token in localStorage when the cookie holds the refresh token', async () => {
    const { stored, loaded } = await kept('1')

    expect(stored).toBe('')
    expect(loaded?.accessToken).toBe('access-1')
  })

  it('still stores the session in localStorage when the flag is off', async () => {
    expect((await kept('')).stored).toContain('refresh-1')
  })
})
