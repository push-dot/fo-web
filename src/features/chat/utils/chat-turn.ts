import { ApiError, type A2uiAnswerContext, type A2uiFrame, type A2uiKind, type A2uiMessage, type AccessMode, type ApprovalResolution, type ChatIntent, type ConversationTurn, type StreamEvent, type ToolRunState } from '@push/api-client'
import type { SurfaceHost } from '../../../shared/a2ui'
import { toPostingDraft, type PostingDraft } from '../../../shared/model/employer-chat'
import { DRAFT_TOOL, PENDING_TOOL_STATES } from '../constants'

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
  state: ToolRunState | 'stop'
  summary: string
  target?: string
  resultLine?: string
  extra?: string[]
  error?: string
  draft?: PostingDraft
  postingId?: string
}

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

export type TurnWatch = {
  onPollFailure?: () => void
  onPollRecovered?: () => void
}

const MAX_POLL_RETRIES = 3

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

export const followTurn = (
  deps: TurnDeps,
  id: string,
  after: number | undefined,
  onEvent: (event: StreamEvent) => void,
  signal?: AbortSignal,
  watch?: TurnWatch,
) => finish(deps, id, { ended: false, seq: after, pollFailed: false }, onEvent, signal, watch)

export const resumeStoredTurn = (
  deps: TurnDeps,
  id: string,
  _stored: ConversationTurn,
  onEvent: (event: StreamEvent) => void,
  signal?: AbortSignal,
  watch?: TurnWatch,
) => followTurn(deps, id, undefined, onEvent, signal, watch)

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

export type RunState = { started: boolean; stopped: boolean }

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

export const cancelTurn = async (deps: TurnDeps, id: string) => {
  try {
    await deps.cancel(id)
  } catch (error) {
    if (!(error instanceof ApiError && error.status === 409)) throw error
  }
}
