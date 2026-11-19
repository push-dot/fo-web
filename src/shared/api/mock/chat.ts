import type { Conversation, ConversationListItem, ConversationTurn, Message, StreamEvent } from '@push/api-client'
import { sessionStore } from '../../auth/session'
import { assistantReply, type ChatIntent } from '../../model/employer-chat'
import { CHAT_SCRIPTS, CHAT_SEED_ATTACHMENTS, CHAT_TURNS, type ChatScriptName } from './chat-scripts'
import { CHAT_SEEDS, DRAFT_REPLY } from './fixtures'
import { type MockSwitch, companyMe, json, mockSwitch, personaKey, readForm, readJson, routeTail } from './core'

export type ChatListMeta = NonNullable<(typeof CHAT_SEEDS)[number]['list']>

export type ChatBucket = {
  conversations: Conversation[]
  messages: Map<string, Message[]>
  postingIds: Map<string, string>
  listMeta: Map<string, ChatListMeta>
  // Finished jobs, oldest first: push-be stores every streamed job and GET .../turns replays them.
  turns: Map<string, ConversationTurn[]>
}

export const chatBuckets = new Map<string, ChatBucket>()
export let chatSeq = 0
export let messageSeq = 0

export const seededChat = (): ChatBucket => {
  const bucket: ChatBucket = { conversations: [], messages: new Map(), postingIds: new Map(), listMeta: new Map(), turns: new Map() }
  if (!companyMe()) return bucket
  for (const seed of CHAT_SEEDS) {
    bucket.conversations.push({
      id: seed.id,
      revision: 1,
      applicationId: null,
      title: seed.title,
      pinned: false,
      createdAt: seed.updatedAt,
      updatedAt: seed.updatedAt,
    })
    bucket.messages.set(
      seed.id,
      seed.messages.map(([role, text], index) => ({
        id: `${seed.id}-m${index + 1}`,
        conversationId: seed.id,
        role,
        text,
        attachments: index === 0 && mockSwitch('chat-turns') ? (CHAT_SEED_ATTACHMENTS[seed.id] ?? []) : [],
        operationId: null,
        createdAt: seed.updatedAt,
      })),
    )
    if (seed.postingId) bucket.postingIds.set(seed.id, seed.postingId)
    if (seed.list) bucket.listMeta.set(seed.id, seed.list)
  }
  return bucket
}

export const chatBucket = (): ChatBucket => {
  const key = personaKey()
  const existing = chatBuckets.get(key)
  if (existing) return existing
  const created = seededChat()
  chatBuckets.set(key, created)
  return created
}

export const chatMessage = (conversationId: string, role: Message['role'], text: string): Message => ({
  id: `m-${++messageSeq}`,
  conversationId,
  role,
  text,
  attachments: [],
  operationId: null,
  createdAt: new Date().toISOString(),
})

export const asIntent = (value: unknown): ChatIntent | undefined =>
  value === 'posting' || value === 'review' || value === 'interview' || value === 'general' ? value : undefined

export const planRequired = (requiredPlan: 'PRO' | 'ULTRA', message: string) =>
  json(403, { error: { code: 'PLAN_REQUIRED', message, details: { requiredPlan } } })

export const interviewBlocked = (payload: Record<string, unknown>) => {
  const plan = companyMe()?.plan ?? null
  if (plan === 'PRO' || plan === 'ULTRA') return false
  const text = String(payload.text ?? '')
  return payload.intent === 'interview' || text.includes('면접 준비') || text.includes('면접 질문')
}

export const SSE_GAP_MS = 250

export const LIVE_SCRIPTS: [MockSwitch, ChatScriptName][] = [
  ['chat-approve', 'approve'],
  ['chat-tool', 'tool'],
  ['chat-writing', 'writing'],
  ['chat-queue', 'queue'],
  ['chat-draft', 'draft'],
]

export type JobFrame = ConversationTurn['events'][number] | StreamEvent

/**
 * A chat job runs on its own, like a push-be worker: streams only read its frames, so closing one leaves the job
 * running, GET .../turns lists it as RUNNING, and stream/active picks it up again after a seq.
 */
export type MockJob = {
  conversationId: string
  jobId: string
  userMessageId: string | null
  frames: JobFrame[]
  ended: boolean
  listeners: Set<() => void>
  cancel: () => void
}

export const runningJobs = new Map<string, MockJob>()
export const activeJobs = new Set<MockJob>()
export let jobSeq = 0

export const tokensOf = (events: StreamEvent[]) => events.flatMap((event) => (event.type === 'token' ? [event.text] : [])).join('')

// push-be turn_events joins consecutive token rows and keeps the first seq. Status and done are not replayed.
export const storedEvents = (frames: JobFrame[]): ConversationTurn['events'] => {
  const events: ConversationTurn['events'] = []
  for (const event of frames) {
    if (event.type === 'status' || event.type === 'done') continue
    const last = events.at(-1)
    if (event.type === 'token' && last?.type === 'token') {
      events[events.length - 1] = { ...last, text: `${last.text}${event.text}` }
      continue
    }
    events.push(event.type === 'token' ? { ...event } : event)
  }
  return events
}

// push-be checkBackpressure: QUEUED+RETRY count above the plan depth is QUEUE_BUSY. A running conversation is not.
export const QUEUE_DEPTH_LIMIT = { FREE: 20, BASIC: 40, PRO: 200, ULTRA: 1000 } as const

export const queueBusy = (depth: number, plan: string | null | undefined) => {
  const limit = plan === 'BASIC' || plan === 'PRO' || plan === 'ULTRA' ? QUEUE_DEPTH_LIMIT[plan] : QUEUE_DEPTH_LIMIT.FREE
  return depth > limit
}

export const queueBusyBody = (depth: number, plan: string | null | undefined) =>
  queueBusy(depth, plan)
    ? { code: 'QUEUE_BUSY' as const, message: 'queue is busy', details: { retryAfterSec: 30, ahead: depth } }
    : null

export const startJob = (
  conversationId: string,
  events: StreamEvent[],
  stall: boolean,
  userMessageId: string | null,
  onEnd: (job: MockJob, status: 'DONE' | 'CANCELLED') => void,
) => {
  let at = 0
  let timer: ReturnType<typeof setTimeout> | undefined
  const job: MockJob = {
    conversationId,
    jobId: `mock-job-${++jobSeq}`,
    userMessageId,
    frames: [],
    ended: false,
    listeners: new Set(),
    cancel: () => {
      clearTimeout(timer)
      job.frames.push({ type: 'cancelled', seq: job.frames.length + 1 })
      close('CANCELLED')
    },
  }
  const notify = () => job.listeners.forEach((listener) => listener())
  const close = (status: 'DONE' | 'CANCELLED') => {
    clearTimeout(timer)
    job.ended = true
    activeJobs.delete(job)
    if (runningJobs.get(conversationId) === job) runningJobs.delete(conversationId)
    onEnd(job, status)
    notify()
  }
  const tick = () => {
    const event = events[at]
    if (!event) {
      if (!stall) close('DONE')
      return
    }
    at += 1
    job.frames.push({ ...event, seq: job.frames.length + 1 })
    // push-be stores the messages and the job before it sends done, so a refetch right after done sees them.
    if (event.type === 'done') {
      close('DONE')
      return
    }
    notify()
    timer = setTimeout(tick, SSE_GAP_MS)
  }
  activeJobs.add(job)
  runningJobs.set(conversationId, job)
  tick()
  return job
}

/** The frames of a job after `after`, then each new one, until it ends; closing the stream leaves the job alone. */
export const jobStream = (job: MockJob, after = 0) => {
  const encoder = new TextEncoder()
  let sent = after
  let listener: (() => void) | undefined
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      listener = () => {
        for (const frame of job.frames.slice(sent)) controller.enqueue(encoder.encode(`data: ${JSON.stringify(frame)}\n\n`))
        sent = job.frames.length
        if (!job.ended) return
        job.listeners.delete(listener as () => void)
        controller.close()
      }
      job.listeners.add(listener)
      listener()
    },
    cancel() {
      if (listener) job.listeners.delete(listener)
    },
  })
  return new Response(body, { status: 200, headers: { 'Content-Type': 'text/event-stream' } })
}

export const creditsSpent = () => json(402, { error: { code: 'INSUFFICIENT_CREDITS', message: '이번 달 사용량을 다 썼어요' } })

export const fileNameOf = (value: FormDataEntryValue | null) => {
  if (typeof File !== 'undefined' && value instanceof File && value.name) return value.name
  return 'file'
}

/** push-be keeps every job with its frames; a cancelled one writes no reply. */
export const rememberJob = (bucket: ChatBucket, conversation: Conversation) => (job: MockJob, status: 'DONE' | 'CANCELLED') => {
  const id = conversation.id
  const text = status === 'DONE' ? tokensOf(job.frames as StreamEvent[]) : ''
  const reply = text ? chatMessage(id, 'ASSISTANT', text) : null
  if (reply) bucket.messages.set(id, [...(bucket.messages.get(id) ?? []), reply])
  conversation.updatedAt = new Date().toISOString()
  bucket.turns.set(id, [
    ...(bucket.turns.get(id) ?? []),
    {
      jobId: job.jobId,
      status,
      createdAt: conversation.updatedAt,
      userMessageId: job.userMessageId,
      assistantMessageId: reply?.id ?? null,
      answer: null,
      events: storedEvents(job.frames),
    },
  ])
}

export const approvalTitle = (frames: JobFrame[]) => {
  for (let index = frames.length - 1; index >= 0; index -= 1) {
    const frame = frames[index]
    if (frame?.type === 'approval' && frame.title) return frame.title
  }
  return null
}

export const runningLine = (frames: JobFrame[]) => {
  for (let index = frames.length - 1; index >= 0; index -= 1) {
    const frame = frames[index]
    if (!frame) continue
    if (frame.type === 'status' && frame.text) return frame.text
    if (frame.type === 'tool') {
      const line = [frame.summary, frame.target].filter(Boolean).join(' · ')
      if (line) return line
    }
  }
  return null
}

/** GET /conversations row, matching push-be conversationJson. */
export const conversationListItem = (bucket: ChatBucket, conversation: Conversation): ConversationListItem => {
  const messages = bucket.messages.get(conversation.id) ?? []
  const job = runningJobs.get(conversation.id)
  const live = job && !job.ended ? job : undefined
  const approval = live ? approvalTitle(live.frames) : null
  const seeded = bucket.listMeta.get(conversation.id)
  return {
    ...conversation,
    status: approval ? 'NEEDS_APPROVAL' : live ? 'RUNNING' : (seeded?.status ?? 'DONE'),
    queuePosition: live ? null : (seeded?.queuePosition ?? null),
    lastLine: approval ?? (live ? runningLine(live.frames) : (seeded?.lastLine ?? null)),
    lastMessagePreview: (messages.at(-1)?.text ?? '').slice(0, 140),
    createdBy: { displayName: seeded?.author ?? sessionStore.load()?.user.displayName ?? '이민아' },
    postingId: bucket.postingIds.get(conversation.id) ?? null,
  }
}

export const handleEmployerChat = async (method: string, url: URL, pathname: string, input: RequestInfo | URL, init?: RequestInit) => {
  const tail = routeTail(pathname)
  if (!tail.startsWith('/conversations')) return null
  const attachment = tail.match(/^\/conversations\/([^/]+)\/attachments$/)
  if (attachment && method === 'POST') {
    if ((companyMe()?.plan ?? null) !== 'ULTRA') return planRequired('ULTRA', 'Ultra에서 외부 PDF를 올릴 수 있어요')
    const form = await readForm(input, init)
    return json(201, { data: { id: 'file-1', fileName: fileNameOf(form?.get('file') ?? null) } })
  }
  const messagesPath = tail.match(/^\/conversations\/([^/]+)\/messages$/)
  if (messagesPath && (method === 'GET' || method === 'POST')) {
    const id = decodeURIComponent(messagesPath[1] ?? '')
    const bucket = chatBucket()
    const conversation = bucket.conversations.find((item) => item.id === id)
    if (!conversation) return json(404, { error: { code: 'NOT_FOUND', message: '대화를 찾지 못했어요' } })
    const items = bucket.messages.get(id) ?? []
    // push-be pages messages newest first; the bucket keeps them oldest first.
    if (method === 'GET') return json(200, { data: [...items].reverse(), page: { nextCursor: null, hasMore: false, total: items.length } })
    const payload = await readJson(input, init)
    if (mockSwitch('chat-limit')) return creditsSpent()
    if (interviewBlocked(payload)) return planRequired('PRO', 'Pro부터 면접 질문을 만들 수 있어요')
    const text = String(payload.text ?? '')
    const user = chatMessage(id, 'USER', text)
    const reply = bucket.postingIds.has(id) ? DRAFT_REPLY : assistantReply(asIntent(payload.intent), text)
    const assistant = chatMessage(id, 'ASSISTANT', reply)
    const next = [...items, user, assistant]
    bucket.messages.set(id, next)
    conversation.updatedAt = assistant.createdAt
    return json(202, { data: null })
  }
  const streamPath = tail.match(/^\/conversations\/([^/]+)\/messages\/stream(\/active)?$/)
  if (streamPath) {
    const id = decodeURIComponent(streamPath[1] ?? '')
    const bucket = chatBucket()
    const conversation = bucket.conversations.find((item) => item.id === id)
    if (!conversation) return json(404, { error: { code: 'NOT_FOUND', message: '대화를 찾지 못했어요' } })
    if (streamPath[2]) {
      const job = runningJobs.get(id)
      if (method !== 'GET' || !job) return new Response(null, { status: 204 })
      return jobStream(job, Number(url.searchParams.get('after') ?? 0))
    }
    if (method !== 'POST') return null
    const payload = await readJson(input, init)
    if (mockSwitch('chat-limit')) return creditsSpent()
    if (interviewBlocked(payload)) return planRequired('PRO', 'Pro부터 면접 질문을 만들 수 있어요')
    const busy = queueBusyBody(activeJobs.size, companyMe()?.plan)
    if (busy) return json(429, { error: busy })
    const text = String(payload.text ?? '')
    const question = chatMessage(id, 'USER', text)
    bucket.messages.set(id, [...(bucket.messages.get(id) ?? []), question])
    const live = LIVE_SCRIPTS.find(([name]) => mockSwitch(name))
    const script = live ? CHAT_SCRIPTS[live[1]] : null
    if (script?.title) conversation.title = script.title
    conversation.updatedAt = new Date().toISOString()
    const reply = bucket.postingIds.has(id) ? DRAFT_REPLY : assistantReply(asIntent(payload.intent), text)
    const events: StreamEvent[] = script?.events ?? [
      { type: 'token', text: reply },
      { type: 'done', operation: null },
    ]
    return jobStream(startJob(id, events, script?.stall ?? false, question.id, rememberJob(bucket, conversation)))
  }
  const cancelPath = tail.match(/^\/conversations\/([^/]+)\/stream\/cancel$/)
  if (cancelPath && method === 'POST') {
    const id = decodeURIComponent(cancelPath[1] ?? '')
    if (!chatBucket().conversations.some((item) => item.id === id)) {
      return json(404, { error: { code: 'NOT_FOUND', message: '대화를 찾지 못했어요' } })
    }
    const jobs = [...activeJobs].filter((job) => job.conversationId === id)
    const job = jobs.at(-1)
    if (!job) return json(409, { error: { code: 'CONFLICT', message: 'no active stream' } })
    for (const item of jobs) item.cancel()
    return json(200, { data: { jobId: job.jobId, status: 'CANCELLED' } })
  }
  const approvalPath = tail.match(/^\/conversations\/([^/]+)\/approvals\/([^/]+)$/)
  if (approvalPath && method === 'POST') {
    const payload = await readJson(input, init)
    const optionId = String(payload.optionId ?? '')
    const approved = optionId === 'approve'
    const id = decodeURIComponent(approvalPath[1] ?? '')
    const bucket = chatBucket()
    const conversation = bucket.conversations.find((item) => item.id === id)
    if (conversation) startJob(id, CHAT_SCRIPTS[approved ? 'approved' : 'rejected'].events, false, null, rememberJob(bucket, conversation))
    return json(200, { data: { id: approvalPath[2], status: approved ? 'APPROVED' : 'REJECTED', optionId } })
  }
  const turnsPath = tail.match(/^\/conversations\/([^/]+)\/turns$/)
  if (turnsPath && method === 'GET') {
    const turnsId = decodeURIComponent(turnsPath[1] ?? '')
    const seeded = mockSwitch('chat-turns') ? (CHAT_TURNS[turnsId] ?? []) : []
    // Newest first, as push-be pages them.
    const job = runningJobs.get(turnsId)
    const running: ConversationTurn[] = job
      ? [{ jobId: job.jobId, status: 'RUNNING', createdAt: new Date().toISOString(), userMessageId: job.userMessageId, assistantMessageId: null, answer: null, events: storedEvents(job.frames) }]
      : []
    const data = [...running, ...[...(chatBucket().turns.get(turnsId) ?? [])].reverse(), ...seeded]
    return json(200, { data, page: { nextCursor: null, hasMore: false, total: data.length } })
  }
  if (method === 'GET' && tail === '/conversations') {
    const audience = url.searchParams.get('audience')
    const bucket = chatBucket()
    const items =
      audience && audience !== 'EMPLOYER'
        ? []
        : [...bucket.conversations].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)).map((conversation) => conversationListItem(bucket, conversation))
    return json(200, { data: items, page: { nextCursor: null, hasMore: false, total: items.length } })
  }
  if (method === 'POST' && tail === '/conversations') {
    const payload = await readJson(input, init)
    if (payload.audience !== 'EMPLOYER') return json(404, { error: { code: 'NOT_FOUND', message: '대화를 만들지 못했어요' } })
    if (!companyMe()) return json(403, { error: { code: 'BUSINESS_NOT_VERIFIED', message: '사업자 인증이 필요해요' } })
    const now = new Date().toISOString()
    const id = `c-${++chatSeq}`
    const conversation: Conversation = {
      id,
      revision: 1,
      applicationId: typeof payload.applicationId === 'string' ? payload.applicationId : null,
      title: String(payload.title ?? ''),
      pinned: false,
      createdAt: now,
      updatedAt: now,
    }
    const bucket = chatBucket()
    const seeded = typeof payload.postingId === 'string' ? bucket.conversations.find((item) => bucket.postingIds.get(item.id) === payload.postingId) : undefined
    if (seeded) return json(201, { data: seeded })
    bucket.conversations.unshift(conversation)
    bucket.messages.set(id, [])
    if (typeof payload.postingId === 'string') bucket.postingIds.set(id, payload.postingId)
    return json(201, { data: conversation })
  }
  return json(404, { error: { code: 'NOT_FOUND', message: `mock: ${pathname}` } })
}
