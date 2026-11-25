import type { StreamEvent } from '@push/api-client'
import { describe, expect, it, vi } from 'vitest'
import { EMPTY_TURN, turnText } from '../utils/chat-turn'
import { createLiveTurnStore } from '../stores'

const token = (text: string, seq: number): StreamEvent => ({ type: 'token', text, seq })

const manual = () => {
  const queued: (() => void)[] = []
  return { frame: (run: () => void) => (queued.push(run), () => void queued.splice(queued.indexOf(run), 1)), step: () => queued.splice(0).forEach((run) => run()), pending: () => queued.length }
}

describe('live turn store', () => {
  it('folds the events of one frame into one change', () => {
    const clock = manual()
    const store = createLiveTurnStore(clock.frame)
    const changed = vi.fn()
    store.begin(EMPTY_TURN)
    store.subscribe(changed)
    store.push(token('안', 1))
    store.push(token('녕', 2))
    expect(clock.pending()).toBe(1)
    expect(changed).not.toHaveBeenCalled()
    clock.step()
    expect(changed).toHaveBeenCalledTimes(1)
    expect(turnText(store.turn()!)).toBe('안녕')
  })

  it('has no turn until the first frame lands', () => {
    const clock = manual()
    const store = createLiveTurnStore(clock.frame)
    store.begin(null)
    expect(store.has()).toBe(false)
    store.push(token('안', 1))
    clock.step()
    expect(store.has()).toBe(true)
  })

  it('ignores events outside a run and drops the ones still queued when it ends', () => {
    const clock = manual()
    const store = createLiveTurnStore(clock.frame)
    store.push(token('버림', 1))
    expect(clock.pending()).toBe(0)
    store.begin(null)
    store.push(token('안', 1))
    store.end()
    clock.step()
    expect(store.turn()).toBeNull()
  })

  it('keeps a turn already on screen when an answer begins again', () => {
    const clock = manual()
    const store = createLiveTurnStore(clock.frame)
    store.begin(null)
    store.push(token('안', 1))
    clock.step()
    store.begin(EMPTY_TURN)
    expect(turnText(store.turn()!)).toBe('안')
  })
})
