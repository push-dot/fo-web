// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest'

const reply = (url: string) =>
  url.includes('/stream')
    ? new Response('data: {"type":"done","operation":null,"seq":1}\n\n', { status: 200 })
    : new Response(JSON.stringify({ data: [], page: { nextCursor: null, hasMore: false } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })

const transport = () => {
  const seen: { path: string; version: string | null }[] = []
  const fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = new Request(input, init)
    seen.push({ path: new URL(request.url).pathname.replace(/^.*\/api\/v1/, ''), version: request.headers.get('A2UI-Version') })
    return reply(request.url)
  })
  return { fetch, seen }
}

const drain = async (events: AsyncIterable<unknown>) => {
  for await (const _ of events) void _
}

const calls = async () => {
  const { api } = await import('./client')
  await drain(api.conversations.stream('c1', { text: '안녕', accessMode: 'AUTO' }))
  await drain(api.conversations.follow('c1'))
  await api.conversations.turns('c1')
  await api.conversations.messages('c1')
}

const EXPECTED = [
  { path: '/conversations/c1/messages/stream', version: '1.0' },
  { path: '/conversations/c1/messages/stream/active', version: '1.0' },
  { path: '/conversations/c1/turns', version: '1.0' },
  { path: '/conversations/c1/messages', version: null },
]

afterEach(() => {
  delete (window as { __PUSH__?: unknown }).__PUSH__
  vi.doUnmock('./mock')
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe('A2UI-Version from the web client', () => {
  it('sends 1.0 on every request that returns Bot frames', async () => {
    const { fetch, seen } = transport()
    vi.stubGlobal('fetch', fetch)
    vi.resetModules()
    await calls()
    expect(seen).toEqual(EXPECTED)
  })

  it('sends 1.0 in mock mode too', async () => {
    const { fetch, seen } = transport()
    ;(window as { __PUSH__?: unknown }).__PUSH__ = { mock: true }
    vi.doMock('./mock', () => ({ mockFetch: fetch }))
    vi.resetModules()
    await calls()
    expect(seen).toEqual(EXPECTED)
  })
})
