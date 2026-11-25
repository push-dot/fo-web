import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react'
import { type ChatActions, type ChatUsage } from './types'
import {
  ApiError,
  type A2uiAnswerContext,
  type AccessMode,
  type ConversationTurn,
  type Message,
  type StreamEvent,
} from '@push/api-client'
import { useQueryClient, type InfiniteData } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import type { SurfaceHost } from '../../shared/a2ui'
import { withCleanup } from '../../shared/lib/with-cleanup'
import type { ChatIntent } from './utils/employer-chat'
import {
  acceptedFailure,
  approvalFailureFrom,
  chatGateFrom,
  composerAfterVanish,
  questionForComposer,
  type ApprovalFailure,
  type ChatBlock,
} from './utils/chat-gate'
import type { LiveTurn } from './utils/chat-thread'
import {
  answerApproval,
  applyTurnEvent,
  cancelTurn,
  EMPTY_TURN,
  markStarted,
  markStopped,
  resumeStoredTurn,
  runTurn,
  turnText,
  type ChatTurn,
  type RunState,
} from './utils/chat-turn'
import { conversationsAttach, conversationsCreateEmployer, chatTurnDeps } from './api/fetchers'
import { createLiveTurnStore } from './stores'
import { useCompanyBilling, usePaymentsOpen } from '../billing'
import { useEmployerPlan } from '../company'
import { PLAN_NAME } from '../billing'
import { usedPercent } from './utils/chat-usage'

const idle: ChatActions = {
  busy: true,
  surfaces: null,
  waiting: undefined,
  people: [],
  send: () => undefined,
  focus: () => undefined,
  redraft: () => undefined,
  copied: () => undefined,
}

export const ChatActionsContext = createContext<ChatActions>(idle)

export const useChatActions = () => useContext(ChatActionsContext)

export type Outgoing = {
  text: string
  intent: ChatIntent
  applicationId: string
  file: File | null
  closes?: string
}

type Handoff = Outgoing & { held?: boolean }

const handoffs = new Map<string, Handoff>()

type Job = RunState & { controller: AbortController | null }

export type LiveShell = Omit<LiveTurn, 'turn'>

export type ChatSessionCopy = {
  busy: string
  approvalNeeded: string
  pollNotice: string
  streamError: (error: unknown) => string
  stopFailed: (error: unknown) => string
}

type Options = {
  id: string | undefined
  people: { applicationId: string; name: string }[]
  accessMode: AccessMode
  messages: Message[]
  running: ConversationTurn | undefined
  composer: {
    setText: Dispatch<SetStateAction<string>>
    setFile: (file: File | null) => void
    setApplicationId: (id: string) => void
  }
  copy: ChatSessionCopy
  surfaces: SurfaceHost
}

const handoffFor = (out: Outgoing, held: boolean): Handoff => (held ? { ...out, held } : out)

const titleOf = (text: string) => text.split('\n')[0]?.slice(0, 40) ?? text

export const announcedText = (turn: ChatTurn, approvalNeeded: string) =>
  turnText(turn) || (turn.awaiting === 'approval' ? approvalNeeded : '')

export const useChatSession = ({
  id,
  people,
  accessMode,
  messages,
  running,
  composer,
  copy,
  surfaces,
}: Options) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [gate, setGate] = useState<ChatBlock | null>(null)
  const [alert, setAlert] = useState<string | null>(null)
  const [answerFailure, setAnswerFailure] = useState<ApprovalFailure | null>(null)
  const [shell, setShell] = useState<LiveShell | null>(null)
  const [sending, setSending] = useState(false)
  const [halting, setHalting] = useState(false)
  const [sent, setSent] = useState(0)
  const [announce, setAnnounce] = useState('')
  const [store] = useState(createLiveTurnStore)
  const job = useRef<Job | null>(null)
  const attached = useRef<string | null>(null)
  const leaving = useRef<number | undefined>(undefined)

  const knownIds = () => messages.map((message) => message.id)

  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['employer-messages', id] }),
      queryClient.invalidateQueries({ queryKey: ['employer-turns', id] }),
      queryClient.invalidateQueries({ queryKey: ['employer-conversations'] }),
    ])

  const savedMessages = (conversationId: string) => {
    const cached = queryClient.getQueryData<
      InfiniteData<{ data: { id: string; role: string; text: string }[] }>
    >(['employer-messages', conversationId])
    return cached?.pages.flatMap((page) => page.data) ?? []
  }

  const clearPollNotice = () =>
    setAlert((current) => (current === copy.pollNotice ? null : current))
  const watch = {
    onPollFailure: () => setAlert(copy.pollNotice),
    onPollRecovered: clearPollNotice,
  }

  const startLive = (next: LiveShell, turn: ChatTurn | null) => {
    store.end()
    store.begin(turn)
    setShell(next)
  }

  const endLive = () => {
    store.end()
    setShell(null)
  }

  const begin = (controller: AbortController | null): Job => {
    const current = { started: false, stopped: false, controller }
    job.current = current
    return current
  }

  const release = (current: Job) => {
    if (job.current === current) job.current = null
  }

  const halt = (current: Job) => {
    current.controller?.abort()
    if (!id) return
    setHalting(true)
    cancelTurn(chatTurnDeps, id)
      .then(refresh, (error: unknown) => {
        setAlert(copy.stopFailed(error))
        attached.current = null
      })
      .finally(() => setHalting(false))
  }

  const tracker = (current: Job, from: ChatTurn = EMPTY_TURN) => {
    let turn = from
    return {
      onEvent: (event: StreamEvent) => {
        if (markStarted(current)) halt(current)
        turn = applyTurnEvent(turn, event)
        store.push(event)
      },
      finished: () => {
        if (!current.controller?.signal.aborted)
          setAnnounce(announcedText(turn, copy.approvalNeeded))
      },
    }
  }

  const fail = (error: unknown, value: string) => {
    const next = chatGateFrom(error)
    setGate(next)
    if (next === 'credits' || next === 'interview') return true
    endLive()
    composer.setText(value)
    if (next === 'pdf' || next === 'verify') return false
    setAlert(
      next === 'busy' && !(error instanceof ApiError && error.code === 'QUEUE_BUSY')
        ? copy.busy
        : copy.streamError(error),
    )
    return false
  }

  const run = async (conversationId: string, out: Outgoing) => {
    const person = people.find((item) => item.applicationId === out.applicationId)
    setSending(true)
    setGate(null)
    setAlert(null)
    setAnswerFailure(null)
    startLive(
      {
        text: out.text,
        attachments: out.applicationId
          ? [{ type: 'APPLICATION', id: out.applicationId, title: person?.name }]
          : [],
        known: knownIds(),
      },
      null,
    )
    setSent((count) => count + 1)
    const controller = new AbortController()
    const current = begin(controller)
    const track = tracker(current)
    let keep = false
    let vanished: unknown = null
    const knownAtSend = knownIds()
    const payload = {
      text: out.text,
      accessMode,
      intent: out.intent,
      applicationId: out.applicationId || undefined,
    }
    const onFailure = (error: unknown) => {
      if (controller.signal.aborted) return
      const accepted = acceptedFailure(error)
      if (accepted === 'kept') {
        setAlert(copy.streamError(error))
        vanished = error
      } else if (!current.started || accepted !== 'dropped') {
        keep = fail(error, out.text)
      }
    }
    await withCleanup(
      async () => {
        try {
          if (out.file) {
            const form = new FormData()
            form.append('file', out.file)
            await conversationsAttach(conversationId, form)
            composer.setFile(null)
          }
          if (current.stopped) {
            composer.setText((typed) => composerAfterVanish(typed, out.text))
            return
          }
          let first = true
          await runTurn(
            chatTurnDeps,
            conversationId,
            payload,
            (event) => {
              if (first) {
                void queryClient.invalidateQueries({ queryKey: ['employer-conversations'] })
                if (out.closes) surfaces.patch(out.closes, { open: false, picked: [] })
              }
              first = false
              track.onEvent(event)
            },
            controller.signal,
            watch,
          )
          track.finished()
        } catch (error) {
          onFailure(error)
        }
      },
      async () => {
        await refresh()
        const back = vanished
          ? questionForComposer(vanished, out.text, savedMessages(conversationId), knownAtSend)
          : null
        if (back) composer.setText((current) => composerAfterVanish(current, back))
        if (!keep) endLive()
        release(current)
        setSending(false)
      },
    )
  }

  const follow = async (turn: ConversationTurn) => {
    if (!id) return
    const controller = new AbortController()
    const current = begin(controller)
    current.started = true
    const track = tracker(current)
    setSending(true)
    startLive({ text: '', attachments: [], known: knownIds(), jobId: turn.jobId }, EMPTY_TURN)
    await withCleanup(
      async () => {
        try {
          await resumeStoredTurn(chatTurnDeps, id, turn, track.onEvent, controller.signal, watch)
          track.finished()
          clearPollNotice()
        } catch (error) {
          if (!controller.signal.aborted) setAlert(copy.streamError(error))
        }
      },
      async () => {
        await refresh()
        endLive()
        release(current)
        setSending(false)
      },
    )
  }

  const start = async (out: Outgoing) => {
    setSending(true)
    setGate(null)
    setAlert(null)
    const current = begin(null)
    await withCleanup(
      async () => {
        try {
          const created = await conversationsCreateEmployer({ title: titleOf(out.text) })
          handoffs.set(created.id, handoffFor(out, current.stopped))
          await queryClient.invalidateQueries({ queryKey: ['employer-conversations'] })
          navigate(`/employer/chat/${created.id}`, { state: { intent: out.intent } })
        } catch (error) {
          setSending(false)
          fail(error, out.text)
        }
      },
      () => release(current),
    )
  }

  const send = (out: Outgoing) => {
    composer.setApplicationId('')
    if (id) void run(id, out)
    else void start(out)
  }

  useEffect(() => {
    const out = id ? handoffs.get(id) : undefined
    if (!id || !out) return
    handoffs.delete(id)
    if (out.held) {
      composer.setText(out.text)
      composer.setApplicationId(out.applicationId)
      composer.setFile(out.file)
      return
    }
    void run(id, out)
  }, [id])

  useEffect(() => {
    if (!running || sending || halting || attached.current === running.jobId) return
    attached.current = running.jobId
    void follow(running)
  }, [running?.jobId, sending, halting])

  const answer = async (surfaceId: string, body: A2uiAnswerContext) => {
    if (sending || !id) return
    setSending(true)
    setAnswerFailure(null)
    store.begin(EMPTY_TURN)
    setShell((current) => current ?? { text: '', attachments: [], known: knownIds() })
    const controller = new AbortController()
    const current = begin(controller)
    const track = tracker(current)
    await withCleanup(
      async () => {
        try {
          await answerApproval(
            chatTurnDeps,
            id,
            surfaceId,
            body,
            track.onEvent,
            controller.signal,
            watch,
            surfaces,
          )
          track.finished()
        } catch (error) {
          if (!controller.signal.aborted) setAnswerFailure(approvalFailureFrom(error))
        }
      },
      async () => {
        await refresh()
        endLive()
        release(current)
        setSending(false)
      },
    )
  }

  const stop = () => {
    const current = job.current
    if (current && markStopped(current)) halt(current)
  }

  useEffect(() => {
    window.clearTimeout(leaving.current)
    return () => {
      leaving.current = window.setTimeout(() => job.current?.controller?.abort(), 0)
    }
  }, [])

  const latest = useRef({ send, answer, stop })
  useEffect(() => {
    latest.current = { send, answer, stop }
  })

  return {
    send: (out: Outgoing) => latest.current.send(out),
    answer: (surfaceId: string, body: A2uiAnswerContext) =>
      void latest.current.answer(surfaceId, body),
    stop: () => latest.current.stop(),
    store,
    shell,
    sending,
    sent,
    gate,
    alert,
    answerFailure,
    announce,
  }
}

export const useChatUsage = (): ChatUsage | null => {
  const { plan } = useEmployerPlan()
  const billing = useCompanyBilling()
  const topup = usePaymentsOpen()
  if (!billing.data) return null
  const percent = usedPercent(billing.data)
  return {
    plan: plan ? `기업 ${PLAN_NAME[plan]}` : '기업',
    percent,
    full: percent >= 100 || billing.data.balanceMicroCredits <= 0,
    topup,
  }
}
