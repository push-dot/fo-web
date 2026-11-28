import { ApiError } from '../api'
import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useApplicantsByPosting } from '../../applications'
import { usePaymentsOpen } from '../../billing'
import { useEmployerPlan, useMyCompany, VERIFY_LINK } from '../../company'
import { useEmployerConversations, useEmployerMessages, useEmployerTurns, useAccessMode } from '../api/hooks'
import { useMyPostings } from '../../postings'
import { applicationTrail, threadItems, type LiveTurn } from '../utils/chat-thread'
import { chatRouteState } from '../utils/chat-gate'
import { applicantPostings, chatPeople } from '../utils/chat-people'
import { EMPTY_TURN, turnRunning, waitingSurface } from '../utils/chat-turn'
import { routeSurfaceAction } from '../utils/surface-action'
import { useChatSession, type Outgoing, ChatActionsContext } from '../hooks'
import { createSurfaceHost, type SurfaceAction } from '../../../shared/a2ui'
import type { ChatIntent } from '../utils/employer-chat'
import { pdfLocked } from '../utils/plan-lock'
import { PLAN_NAME } from '../../billing'
import { useToast } from '../../../shared/ui/toast'
import type { ChatActions, ChatPerson } from '../types'
import ChatSay from './chat-say'
import ChatApp from './chat-app'
import ChatComposer from './chat-composer'
import { APPROVAL_NEEDED, COPIED, DRAFT_REDO_ASK, PDF_NOTE, RETRY_SAVE_ASK } from '../utils/chat-copy'
import ChatLimitCard from './chat-limit-card'
import ChatLock from './chat-lock'
import ChatStarter from './chat-starter'
import ChatThreadList from './chat-thread-list'
import { APPROVAL_FAILURE, CHAT_BUSY, CHAT_FAILED, CHAT_LOADING, PDF_LOCK, stopFailedText, streamErrorText } from '../constants'

const ChatRoom = ({ id, screen }: { id?: string; screen: 'list' | 'new' | 'thread' }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const toast = useToast()
  const route = useRef<(action: SurfaceAction) => void>(() => undefined)
  const [surfaces] = useState(() => createSurfaceHost((action) => route.current(action)))
  const routed = chatRouteState(location.state)
  const { plan, settled } = useEmployerPlan()
  const admin = useMyCompany().data?.role === 'ADMIN'
  const payable = usePaymentsOpen()
  const mode = useAccessMode()
  const [intent, setIntent] = useState<ChatIntent>(routed.intent)
  const [text, setText] = useState(routed.text ?? '')
  const [applicationId, setApplicationId] = useState(routed.applicationId ?? '')
  const [file, setFile] = useState<File | null>(null)
  const conversations = useEmployerConversations()
  const messages = useEmployerMessages(id)
  const turns = useEmployerTurns(id)
  const storedMessages = messages.data?.pages.flatMap((page) => page.data) ?? []
  const storedTurns = turns.data?.pages.flatMap((page) => page.data) ?? []
  const running = storedTurns.find(turnRunning)
  const postings = useMyPostings()
  const peoplePostings = applicantPostings(postings.data?.data ?? [], routed.postingId)
  const applicants = useApplicantsByPosting(peoplePostings.map((item) => item.id))
  const people: ChatPerson[] = chatPeople(peoplePostings, applicants)
  const session = useChatSession({
    id,
    people,
    accessMode: mode.accessMode,
    messages: storedMessages,
    running,
    composer: { setText, setFile, setApplicationId },
    copy: {
      busy: CHAT_BUSY,
      approvalNeeded: APPROVAL_NEEDED,
      pollNotice: streamErrorText(new ApiError('internal error', 'INTERNAL', 0), payable),
      streamError: (error) => streamErrorText(error, payable),
      stopFailed: stopFailedText,
    },
    surfaces,
  })
  const { store, shell, sending, gate } = session

  const hasTurn = useSyncExternalStore(store.subscribe, store.has)
  const liveSurface = useSyncExternalStore(store.subscribe, store.surfaceId)
  const live: LiveTurn | null = shell && { ...shell, turn: hasTurn ? EMPTY_TURN : null }
  const items = threadItems(storedMessages, storedTurns, live)
  const trail = applicationTrail(items)
  const lastItem = items.at(-1)
  const waiting =
    lastItem?.kind === 'turn'
      ? lastItem.live
        ? liveSurface
        : waitingSurface(lastItem.turn)?.surfaceId
      : undefined
  const awaiting = useSyncExternalStore(surfaces.subscribe, () =>
    waiting ? surfaces.read(waiting, 'open') === true : false,
  )
  const thread = conversations.data?.data.find((item) => item.id === id)
  const title = thread?.title
  const posting = postings.data?.data.find((item) => item.id === thread?.postingId)
  const pdfDisabled = !settled || pdfLocked(plan)
  const planName = plan ? PLAN_NAME[plan] : null

  const current = useRef({ sending, intent, applicationId, last: trail.last, toast })
  useEffect(() => {
    current.current = { sending, intent, applicationId, last: trail.last, toast }
  })
  useEffect(() => {
    if (!routed.text) return
    navigate(`${location.pathname}${location.search}`, {
      replace: true,
      state: { intent: routed.intent, postingId: routed.postingId, applicationId: routed.applicationId },
    })
  })
  const { send, answer, stop } = session
  const closes = waiting && awaiting ? waiting : undefined
  useEffect(() => {
    route.current = (action) =>
      routeSurfaceAction(action, {
        waiting,
        answer,
        openPosting: (postingId) => navigate(`/postings/${postingId}`),
        openPlan: () => navigate('/employer/plans'),
        change: () => document.getElementById('chat-input')?.focus(),
        result: {
          retry_save: () => send({ text: RETRY_SAVE_ASK, intent: current.current.intent, applicationId: '', file: null }),
        },
      })
  })
  const actions: ChatActions = {
    busy: sending,
    surfaces,
    waiting,
    people,
    posting: posting && { id: posting.id, title: posting.title },
    send: (value, nextIntent) => {
      const now = current.current
      if (now.sending) return
      if (nextIntent) setIntent(nextIntent)
      send({
        text: value,
        intent: nextIntent ?? now.intent,
        applicationId: now.applicationId || now.last || '',
        file: null,
        closes,
      })
    },
    focus: () => document.getElementById('chat-input')?.focus(),
    redraft: () => send({ text: DRAFT_REDO_ASK, intent: 'posting', applicationId: '', file: null }),
    copied: () => current.current.toast.show(COPIED),
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = text.trim()
    if (!value || sending) return
    setText('')
    send({ text: value, intent, applicationId, file, closes } satisfies Outgoing)
  }

  const composer = (
    <ChatComposer
      text={text}
      sending={sending}
      awaiting={awaiting}
      applicationId={applicationId}
      people={people}
      file={file}
      pdfLocked={pdfDisabled}
      accessMode={mode.accessMode}
      onAccessMode={mode.pick}
      onText={setText}
      onApplication={setApplicationId}
      onFile={setFile}
      onStop={stop}
      onSubmit={submit}
    />
  )
  const dock =
    gate === 'credits' ? (
      <ChatLimitCard ultra={plan === 'ULTRA'} admin={admin} payable={payable} />
    ) : (
      composer
    )
  const loadingThread = id && !live && !messages.data
  const loadOlder = () => {
    if (messages.isFetchingNextPage || turns.isFetchingNextPage) return
    if (messages.hasNextPage) void messages.fetchNextPage()
    if (turns.hasNextPage) void turns.fetchNextPage()
  }
  const notes = (
    <>
      {id && file && items.length === 0 ? <ChatSay text={PDF_NOTE} soft /> : null}
      {gate === 'interview' ? <ChatLock plan={planName} /> : null}
      {gate === 'pdf' ? <p className="c1 t3">{PDF_LOCK}</p> : null}
      {gate === 'verify' ? (
        <Link className="text-link" to="/employer/verify">
          {VERIFY_LINK}
        </Link>
      ) : null}
      {session.answerFailure ? (
        <p className="b2" role="alert">
          {APPROVAL_FAILURE[session.answerFailure]}
        </p>
      ) : null}
      {session.alert ? (
        <p className="b2" role="alert">
          {session.alert}
        </p>
      ) : null}
    </>
  )
  const start = !id && items.length === 0
  return (
    <ChatActionsContext.Provider value={actions}>
      <ChatApp
        screen={screen}
        activeId={id}
        title={id ? title : undefined}
        dock={dock}
        announce={session.announce}
      >
        {start ? (
          <div className="chat-col">
            {file ? (
              <ChatSay text={PDF_NOTE} soft />
            ) : (
              <ChatStarter
                applicant={(people.find((person) => person.applicationId === applicationId) ?? people[0])?.name}
                onPick={(card) => {
                  setIntent(card.intent)
                  setText(card.example)
                  actions.focus()
                }}
              />
            )}
            {notes}
          </div>
        ) : (
          <ChatThreadList
            items={items}
            before={trail.before}
            store={store}
            listKey={id}
            pin={session.sent}
            onStartReached={loadOlder}
            header={
              id && messages.isError ? (
                <p className="b1" role="alert">
                  {CHAT_FAILED}
                </p>
              ) : loadingThread ? (
                <p className="b2 t3">{CHAT_LOADING}</p>
              ) : null
            }
            footer={notes}
          />
        )}
      </ChatApp>
    </ChatActionsContext.Provider>
  )
}

export default ChatRoom
