// @vitest-environment happy-dom
import type { StreamEvent } from '@push/api-client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { SurfaceHost } from '../../shared/a2ui'
import { runTurn } from './chat-turn'
import { useChatSession, type Outgoing } from './use-chat-session'

vi.mock('./chat-turn', async (original) => ({
  ...(await original<typeof import('./chat-turn')>()),
  runTurn: vi.fn(),
}))
;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

let root: Root | null = null
afterEach(() => {
  act(() => root?.unmount())
  root = null
  vi.mocked(runTurn).mockReset()
})

const settle = () => act(async () => new Promise((resolve) => setTimeout(resolve, 0)))

/** Sends one typed message that answers the waiting surface `s1`, and returns what the surface host was told. */
const sendTyped = async () => {
  const patch = vi.fn()
  let send: ((out: Outgoing) => void) | undefined
  const Probe = () => {
    send = useChatSession({
      id: 'c1',
      people: [],
      accessMode: 'FULL' as never,
      messages: [],
      running: undefined,
      composer: { setText: () => undefined, setFile: () => undefined, setApplicationId: () => undefined },
      copy: { busy: '', approvalNeeded: '', pollNotice: '', streamError: () => '', stopFailed: () => '' },
      surfaces: { patch } as unknown as SurfaceHost,
    }).send
    return null
  }
  root = createRoot(document.createElement('div'))
  await act(async () =>
    root?.render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <Probe />
        </MemoryRouter>
      </QueryClientProvider>,
    ),
  )
  await act(async () =>
    send?.({ text: '다른 걸로 해줘', intent: 'chat' as never, applicationId: '', file: null, closes: 's1' }),
  )
  await settle()
  return patch
}

describe('a typed message that answers the waiting surface', () => {
  it('closes the surface with no pick once the server takes the message', async () => {
    vi.mocked(runTurn).mockImplementation(async (_deps, _id, _body, onEvent) => {
      onEvent({ type: 'job' } as unknown as StreamEvent)
    })
    expect((await sendTyped()).mock.calls).toEqual([['s1', { open: false, picked: [] }]])
  })

  it('leaves the surface open when the send fails before the stream starts', async () => {
    vi.mocked(runTurn).mockRejectedValue(new Error('offline'))
    expect(await sendTyped()).not.toHaveBeenCalled()
  })
})
