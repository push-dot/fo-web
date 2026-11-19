import type { StreamEvent } from '@push/api-client'
import { applyTurnEvent, EMPTY_TURN, type ChatTurn } from './chat-turn'

type Frame = (run: () => void) => () => void

const nextFrame: Frame = (run) => {
  if (typeof requestAnimationFrame === 'function') {
    const handle = requestAnimationFrame(run)
    return () => cancelAnimationFrame(handle)
  }
  const handle = setTimeout(run, 16)
  return () => clearTimeout(handle)
}

/** The card the turn waits on: the last block, when it is an approval. */
export const lastApprovalId = (turn: ChatTurn | null) => {
  const last = turn?.blocks.at(-1)
  return last?.kind === 'approval' ? last.id : undefined
}

/**
 * The turn streaming now, outside React state: a frame per token would re-render the whole room.
 * Events queue up and fold into the turn once per animation frame; subscribers see one change per frame.
 */
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
    /** Starts a live turn; `null` until the first event arrives. */
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
    approvalId: () => lastApprovalId(turn),
  }
}

export type LiveTurnStore = ReturnType<typeof createLiveTurnStore>
