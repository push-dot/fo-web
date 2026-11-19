import { ApiError } from '@push/api-client'
import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { useEmployerApplicants } from '../../entities/application'
import { usePaymentsOpen } from '../../entities/billing'
import { useEmployerPlan, useMyCompany } from '../../entities/company'
import {
  useEmployerConversations,
  useEmployerMessages,
  useEmployerTurns,
} from '../../entities/conversation'
import { useMyPostings } from '../../entities/posting'
import {
  applicationTrail,
  chatRouteState,
  EMPTY_TURN,
  threadItems,
  turnRunning,
  useAccessMode,
  useChatSession,
  type LiveTurn,
  type Outgoing,
} from '../../features/employer-chat'
import { pdfLocked, type ChatIntent } from '../../shared/model/employer-chat'
import { PLAN_NAME } from '../../shared/model/employer-plan'
import { useToast } from '../../shared/ui/toast'
import { ChatActionsContext, type ChatActions, type ChatPerson } from './chat-actions'
import { ChatSay } from './chat-answer'
import ChatApp from './chat-app'
import ChatComposer from './chat-composer'
import { APPROVAL_NEEDED, COPIED, DRAFT_REDO_ASK, PDF_NOTE } from './chat-copy'
import ChatLimitCard from './chat-limit-card'
import ChatLock from './chat-lock'
import ChatStarter from './chat-starter'
import ChatThreadList from './chat-thread-list'
import {
  APPROVAL_FAILURE,
  CHAT_BUSY,
  CHAT_FAILED,
  CHAT_LOADING,
  PDF_LOCK,
  stopFailedText,
  streamErrorText,
  VERIFY_LINK,
} from './constants'

/** The agent screen: the starter (no `id`) or one conversation, both on the same composer and stream. */
const ChatRoom = ({ id, screen }: { id?: string; screen: 'list' | 'new' | 'thread' }) => {
  const location = useLocation()
  const toast = useToast()
  const routed = chatRouteState(location.state)
  const { plan, settled } = useEmployerPlan()
  const admin = useMyCompany().data?.role === 'ADMIN'
  const payable = usePaymentsOpen()
  const mode = useAccessMode()
  const [intent, setIntent] = useState<ChatIntent>(routed.intent)
  const [text, setText] = useState('')
  const [applicationId, setApplicationId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const conversations = useEmployerConversations()
  const messages = useEmployerMessages(id)
  const turns = useEmployerTurns(id)
  const storedMessages = messages.data?.pages.flatMap((page) => page.data) ?? []
  const storedTurns = turns.data?.pages.flatMap((page) => page.data) ?? []
  const running = storedTurns.find(turnRunning)
  const postings = useMyPostings()
  const openPosting = postings.data?.data.find((item) => !item.closedAt)
  const applicants = useEmployerApplicants(openPosting?.id, undefined, {
    queryKey: ['employer-applicants', openPosting?.id, 'chat'],
    enabled: Boolean(openPosting?.id),
  })
  const people: ChatPerson[] = (applicants.data?.data ?? []).map((item) => ({
    applicationId: item.applicationId,
    name: item.applicant.displayName,
    postingId: openPosting?.id ?? '',
    postingTitle: openPosting?.title ?? '',
  }))
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
  })
  const { store, shell, picked, sending, gate } = session

  // The live turn's blocks stream through the store; the room only learns that one exists and which card it waits on.
  const hasTurn = useSyncExternalStore(store.subscribe, store.has)
  const liveApproval = useSyncExternalStore(store.subscribe, store.approvalId)
  const live: LiveTurn | null = shell && { ...shell, turn: hasTurn ? EMPTY_TURN : null }
  const items = threadItems(storedMessages, storedTurns, live)
  const trail = applicationTrail(items)
  const lastItem = items.at(-1)
  const lastBlock = lastItem?.kind === 'turn' && !lastItem.live ? lastItem.turn.blocks.at(-1) : undefined
  const cardId = lastItem?.kind === 'turn' ? (lastItem.live ? liveApproval : lastBlock?.kind === 'approval' ? lastBlock.id : undefined) : undefined
  const awaiting =
    lastItem?.kind === 'turn' && Boolean(cardId) && !{ ...lastItem.picked, ...picked }[cardId ?? '']
  const title = conversations.data?.data.find((item) => item.id === id)?.title
  const pdfDisabled = !settled || pdfLocked(plan)
  const planName = plan ? PLAN_NAME[plan] : null

  // What the stable actions read at the time of a click.
  const current = useRef({ sending, intent, applicationId, last: trail.last, toast })
  useEffect(() => {
    current.current = { sending, intent, applicationId, last: trail.last, toast }
  })
  const { send, answer, stop } = session
  const actions: ChatActions = {
    busy: sending,
    picked,
    people,
    send: (value, nextIntent) => {
      const now = current.current
      if (now.sending) return
      if (nextIntent) setIntent(nextIntent)
      send({
        text: value,
        intent: nextIntent ?? now.intent,
        applicationId: now.applicationId || now.last || '',
        file: null,
      })
    },
    answer,
    focus: () => document.getElementById('chat-input')?.focus(),
    redraft: () => send({ text: DRAFT_REDO_ASK, intent: 'posting', applicationId: '', file: null }),
    copied: () => current.current.toast.show(COPIED),
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = text.trim()
    if (!value || sending) return
    setText('')
    send({ text: value, intent, applicationId, file } satisfies Outgoing)
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
                applicant={people[0]?.name}
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
