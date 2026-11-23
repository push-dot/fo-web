import {
  ApiError,
  type A2uiAnswerContext,
  type A2uiFrame,
  type A2uiKind,
  type A2uiMessage,
  type AccessMode,
  type ApprovalResolution,
  type ChatIntent,
  type ConversationTurn,
  type StreamEvent,
  type ToolRunState,
} from '@push/api-client'
import type { SurfaceHost } from '../../shared/a2ui'
import { toPostingDraft, type PostingDraft } from '../../shared/model/employer-chat'
import { DRAFT_TOOL, PENDING_TOOL_STATES } from './constants'

export type TurnBody = {
  text: string
  accessMode: AccessMode
  intent?: ChatIntent
  applicationId?: string
}

export type TurnDeps = {
  stream: (id: string, body: TurnBody, signal?: AbortSignal) => AsyncIterable<StreamEvent>
  follow: (id: string, after?: number, signal?: AbortSignal) => AsyncIterable<StreamEvent>
  resolve: (
    id: string,
    approvalId: string,
    optionId: string,
    optionIds?: string[],
  ) => Promise<Pick<ApprovalResolution, 'jobId'>>
  cancel: (id: string) => Promise<unknown>
}

export type TurnText = { kind: 'text'; key: string; text: string }

export type TurnTool = {
  kind: 'tool'
  key: string
  name: string
  /** `stop`: the job was cancelled or failed while this tool still ran. */
  state: ToolRunState | 'stop'
  summary: string
  target?: string
  resultLine?: string
  extra?: string[]
  error?: string
  draft?: PostingDraft
  postingId?: string
}

/** A Bot card: an A2UI surface, upserted by surfaceId. `messages` is the latest full snapshot. */
export type TurnSurface = {
  kind: 'surface'
  key: string
  surfaceId: string
  card: A2uiKind
  messages: A2uiMessage[]
}

export type TurnBlock = TurnText | TurnTool | TurnSurface

export type ChatTurn = {
  blocks: TurnBlock[]
  awaiting: 'approval' | 'choice' | null
  queued: number | null
  /** How a job that did not finish ended: stopped by a member, or failed on the server. */
  ended: 'stopped' | 'failed' | null
}

export const EMPTY_TURN: ChatTurn = { blocks: [], awaiting: null, queued: null, ended: null }

const pending = (block: TurnBlock) =>
  block.kind === 'tool' && (PENDING_TOOL_STATES as readonly string[]).includes(block.state)

const recordOf = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

const toolBlock = (event: Extract<StreamEvent, { type: 'tool' }>, key: string): TurnTool => {
  const result = recordOf(event.result)
  const draft =
    event.name === DRAFT_TOOL && event.state === 'ok' ? toPostingDraft(result.draft) : null
  const postingId = recordOf(result.draft).id
  return {
    kind: 'tool',
    key,
    name: event.name,
    state: event.state,
    summary: event.summary,
    ...(event.target ? { target: event.target } : {}),
    ...(event.resultLine ? { resultLine: event.resultLine } : {}),
    ...(event.extra?.length ? { extra: event.extra } : {}),
    ...(typeof result.error === 'string' ? { error: result.error } : {}),
    ...(draft ? { draft, ...(typeof postingId === 'string' ? { postingId } : {}) } : {}),
  }
}

const upsertTool = (blocks: TurnBlock[], event: Extract<StreamEvent, { type: 'tool' }>) => {
  const index = blocks
    .map((block) => block.kind === 'tool' && block.name === event.name && pending(block))
    .lastIndexOf(true)
  if (index < 0) return [...blocks, toolBlock(event, `${event.name}-${blocks.length}`)]
  return blocks.map((block, i) =>
    i === index ? toolBlock(event, block.kind === 'tool' ? block.key : '') : block,
  )
}

const appendText = (blocks: TurnBlock[], value: string): TurnBlock[] => {
  const last = blocks.at(-1)
  if (last?.kind === 'text') return [...blocks.slice(0, -1), { ...last, text: last.text + value }]
  return [...blocks, { kind: 'text', key: `text-${blocks.length}`, text: value }]
}

// A later frame of the same surface updates it in place; a new one goes at the end.
const upsertSurface = (blocks: TurnBlock[], event: A2uiFrame): TurnBlock[] => {
  const block: TurnSurface = {
    kind: 'surface',
    key: event.surfaceId,
    surfaceId: event.surfaceId,
    card: event.kind,
    messages: event.messages,
  }
  const index = blocks.findIndex((item) => item.kind === 'surface' && item.surfaceId === event.surfaceId)
  return index < 0 ? [...blocks, block] : blocks.map((item, i) => (i === index ? block : item))
}

/** The surface a turn waits on: its newest approval or choice surface. */
export const waitingSurface = (turn: ChatTurn | null) =>
  [...(turn?.blocks ?? [])]
    .reverse()
    .find(
      (block): block is TurnSurface =>
        block.kind === 'surface' && (block.card === 'approval' || block.card === 'choice'),
    )

const queuedAhead = (event: Extract<StreamEvent, { type: 'status' }>, current: number | null) => {
  if (event.text !== 'queued') return null
  const ahead = recordOf(event).ahead
  return typeof ahead === 'number' ? ahead : (current ?? 0)
}

// A job that ends without done leaves no tool running: the rows still waiting on a result end as stopped.
const end = (turn: ChatTurn, ended: 'stopped' | 'failed'): ChatTurn => ({
  ...turn,
  queued: null,
  awaiting: null,
  ended: turn.ended ?? ended,
  blocks: turn.blocks.map((block) =>
    block.kind === 'tool' && pending(block) ? { ...block, state: 'stop' } : block,
  ),
})

export const applyTurnEvent = (turn: ChatTurn, event: StreamEvent): ChatTurn => {
  switch (event.type) {
    case 'status':
      return { ...turn, queued: queuedAhead(event, turn.queued) }
    case 'token':
      return { ...turn, queued: null, blocks: appendText(turn.blocks, event.text) }
    case 'tool':
      return { ...turn, queued: null, blocks: upsertTool(turn.blocks, event) }
    case 'a2ui':
      return { ...turn, queued: null, blocks: upsertSurface(turn.blocks, event) }
    case 'done':
      return { ...turn, queued: null, awaiting: event.awaiting ?? null }
    case 'cancelled':
    case 'error':
      return end(turn, event.type === 'cancelled' ? 'stopped' : 'failed')
    default:
      return turn
  }
}

const STATUS_END: Partial<Record<ConversationTurn['status'], 'stopped' | 'failed'>> = {
  CANCELLED: 'stopped',
  FAILED: 'failed',
}

/**
 * A job from GET .../turns replayed into the same blocks a live stream builds. push-be bakes each answer into its
 * surface's data model (/open false, /picked).
 * The job status also ends it: a job can close without a cancelled or error row (cancelled while still queued).
 */
export const storedTurn = (turn: ConversationTurn) => {
  const replayed = turn.events.reduce<ChatTurn>(
    (current, event) => applyTurnEvent(current, event),
    EMPTY_TURN,
  )
  const ended = STATUS_END[turn.status]
  return { turn: ended ? end(replayed, ended) : replayed }
}

export const turnRunning = (turn: ConversationTurn) =>
  turn.status === 'PENDING' || turn.status === 'RUNNING'

export const turnText = (turn: ChatTurn) =>
  turn.blocks.flatMap((block) => (block.kind === 'text' ? [block.text] : [])).join('')

const streamError = (error: { code: string; message: string; details?: unknown }) => {
  const details = recordOf(error.details)
  return new ApiError(error.message, error.code, 0, Object.keys(details).length ? details : null)
}

/**
 * The gateway writes this frame when a poll throws, then closes the stream. It has no seq.
 * A real job failure is a stored row, so sseFrame gives it a seq. The job itself is still running.
 */
export const isGatewayPollError = (event: StreamEvent) =>
  event.type === 'error' && event.seq === undefined && event.error.code === 'INTERNAL'

type Read = { ended: boolean; seq?: number; pollFailed: boolean }

const consume = async (
  source: AsyncIterable<StreamEvent>,
  onEvent: (event: StreamEvent) => void,
  after?: number,
): Promise<Read> => {
  let seq = after
  for await (const event of source) {
    if (event.type === 'error') {
      if (isGatewayPollError(event)) return { ended: false, seq, pollFailed: true }
      throw streamError(event.error)
    }
    if (event.seq !== undefined) seq = event.seq
    onEvent(event)
    if (event.type === 'done' || event.type === 'cancelled')
      return { ended: true, seq, pollFailed: false }
  }
  return { ended: false, seq, pollFailed: false }
}

/** Shown while a poll failed, cleared once a later read of the same job succeeds. */
export type TurnWatch = {
  onPollFailure?: () => void
  onPollRecovered?: () => void
}

// A down database can fail every poll. Stop retrying instead of spinning, and leave the notice up.
const MAX_POLL_RETRIES = 3

/** Reads the job to its end: a stream the server closes before done or cancelled is followed from the last seq. */
const finish = async (
  deps: TurnDeps,
  id: string,
  first: Read,
  onEvent: (event: StreamEvent) => void,
  signal?: AbortSignal,
  watch?: TurnWatch,
) => {
  let { ended, seq, pollFailed } = first
  let noticed = false
  let polls = 0
  while (!signal?.aborted) {
    if (pollFailed) {
      polls += 1
      if (!noticed) {
        noticed = true
        watch?.onPollFailure?.()
      }
      if (polls > MAX_POLL_RETRIES)
        throw streamError({ code: 'INTERNAL', message: 'internal error' })
    } else if (ended) {
      if (noticed) watch?.onPollRecovered?.()
      return
    }
    const next = await consume(deps.follow(id, seq, signal), onEvent, seq)
    if (next.pollFailed) {
      // Frames before the poll failure already moved seq. The reconnect must start after them.
      pollFailed = true
      seq = next.seq
      continue
    }
    pollFailed = false
    if (noticed) {
      noticed = false
      polls = 0
      watch?.onPollRecovered?.()
    }
    // No new frame is the 204 of a job that is no longer running.
    if (!next.ended && next.seq === seq) return
    ;({ ended, seq } = next)
    if (ended) return
  }
}

export const runTurn = async (
  deps: TurnDeps,
  id: string,
  body: TurnBody,
  onEvent: (event: StreamEvent) => void,
  signal?: AbortSignal,
  watch?: TurnWatch,
) => finish(deps, id, await consume(deps.stream(id, body, signal), onEvent), onEvent, signal, watch)

/** Follows a job that is already running. `after` is a real gateway seq, not a seq from GET .../turns. */
export const followTurn = (
  deps: TurnDeps,
  id: string,
  after: number | undefined,
  onEvent: (event: StreamEvent) => void,
  signal?: AbortSignal,
  watch?: TurnWatch,
) => finish(deps, id, { ended: false, seq: after, pollFailed: false }, onEvent, signal, watch)

/**
 * Follows a job loaded from GET .../turns.
 * push-be `turn_events` joins consecutive token rows and keeps the first seq. The gateway follow
 * stream then emits each of those rows on its own, so `after` equal to that seq repeats the tail.
 * Replay from the start; the caller applies the frames onto an empty turn.
 */
export const resumeStoredTurn = (
  deps: TurnDeps,
  id: string,
  _stored: ConversationTurn,
  onEvent: (event: StreamEvent) => void,
  signal?: AbortSignal,
  watch?: TurnWatch,
) => followTurn(deps, id, undefined, onEvent, signal, watch)

/**
 * Answers a surface: POST .../approvals/{surfaceId} with the body PushChoice built, then follows the job it resumes.
 * push-be sends no answered frame, so once the server takes the answer the surface is closed on the pick here,
 * until a refetch brings the snapshot push-be baked.
 */
export const answerApproval = async (
  deps: TurnDeps,
  id: string,
  approvalId: string,
  body: A2uiAnswerContext,
  onEvent: (event: StreamEvent) => void,
  signal?: AbortSignal,
  watch?: TurnWatch,
  surfaces?: Pick<SurfaceHost, 'patch'>,
) => {
  const { jobId } = await deps.resolve(id, approvalId, body.optionId, body.optionIds)
  surfaces?.patch(approvalId, { open: false, picked: body.optionIds ?? [body.optionId] })
  if (jobId) await finish(deps, id, { ended: false, pollFailed: false }, onEvent, signal, watch)
}

/** One run on screen: `started` once the job exists (its first frame), `stopped` once the member asked to stop it. */
export type RunState = { started: boolean; stopped: boolean }

/**
 * Both return whether the cancel goes out now. A cancel sent before the job's first frame can reach push-be ahead
 * of the POST that queues the job and come back 409, so a stop before the start waits for the start.
 */
export const markStarted = (run: RunState) => {
  if (run.started) return false
  run.started = true
  return run.stopped
}

export const markStopped = (run: RunState) => {
  if (run.stopped) return false
  run.stopped = true
  return run.started
}

/** Stops the job on the server. 409 means it already ended, which is what the stop was after. */
export const cancelTurn = async (deps: TurnDeps, id: string) => {
  try {
    await deps.cancel(id)
  } catch (error) {
    if (!(error instanceof ApiError && error.status === 409)) throw error
  }
}
