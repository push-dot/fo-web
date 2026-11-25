import type { StreamEvent } from '@push/api-client'
import { applyTurnEvent, EMPTY_TURN, waitingSurface, type ChatTurn } from './chat-turn'

type Frame = (run: () => void) => () => void

const nextFrame: Frame = (run) => {
  if (typeof requestAnimationFrame === 'function') {
    const handle = requestAnimationFrame(run)
    return () => cancelAnimationFrame(handle)
  }
  const handle = setTimeout(run, 16)
  return () => clearTimeout(handle)
}

export const createLiveTurnStore = (frame: Frame = nextFrame) => {
  let turn: ChatTurn | null = null
  let active = false
  let queue: StreamEvent[] = []
  let cancel: (() => void) | null = null
  const listeners = new Set<() => void>()
  const emit = () => listeners.forEach((listener) => listener())

  const flush = () => {
    cancel = null
    if (!active || queue.length === 0) return
    const events = queue
    queue = []
    turn = events.reduce(applyTurnEvent, turn ?? EMPTY_TURN)
    emit()
  }

  return {
    begin: (from: ChatTurn | null) => {
      if (active) return
      active = true
      turn = from
      emit()
    },
    end: () => {
      cancel?.()
      cancel = null
      queue = []
      active = false
      turn = null
      emit()
    },
    push: (event: StreamEvent) => {
      if (!active) return
      queue.push(event)
      cancel ??= frame(flush)
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      return () => void listeners.delete(listener)
    },
    turn: () => turn,
    has: () => turn !== null,
    surfaceId: () => waitingSurface(turn)?.surfaceId,
  }
}

export type LiveTurnStore = ReturnType<typeof createLiveTurnStore>
