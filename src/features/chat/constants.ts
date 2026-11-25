import { type ToolRunState, ApiError, type AccessMode } from '@push/api-client'
import type { ApprovalFailure } from './utils/chat-gate'
import { retryAfterSec } from '../../shared/api/retry-after'

export const DRAFT_TOOL = 'draft_posting'

export const PENDING_TOOL_STATES: readonly ToolRunState[] = ['run', 'wait']

export const HTTP_TOO_MANY_REQUESTS = 429

export const DEFAULT_ACCESS_MODE = 'AUTO' as const

export const CHAT_LOADING = '대화를 불러오고 있어요'

export const CHAT_FAILED = '대화를 불러오지 못했어요'

export const CHAT_STOP_FAILED = '멈추지 못했어요. 한 번 더 눌러 주세요'

export const CHAT_STOP_FORBIDDEN = '다른 담당자가 시작한 작업이라 멈출 수 없어요'

export const stopFailedText = (error: unknown) =>
  error instanceof ApiError && error.status === 403 && error.code === 'FORBIDDEN'
    ? CHAT_STOP_FORBIDDEN
    : CHAT_STOP_FAILED

export const CHAT_EMPTY = '아직 대화가 없어요'

export const PDF_LOCK = 'Ultra에서 외부 PDF를 올릴 수 있어요'

export const COMPOSER_LABEL = '메시지'

export const SEND_MESSAGE = '보내기'

export const DRAFT_POSTING = '공고 편집에서 열기'

export const DRAFT_BADGE = '초안'

export const CHAT_NEW = '새 대화'

export const CHAT_SHARED = '회사 대화 · 담당자 모두 볼 수 있어요'

export const COMPOSER_PLACEHOLDER = '메시지를 입력하세요'

export const ATTACH_LABEL = '공고·지원자'

export const ACCESS_MODE_GROUP = 'AI 실행 방식'

export const ACCESS_MODES = [
  { value: 'ALWAYS_ASK', label: '항상 묻기', description: '바꾸기 전에 매번 물어봐요' },
  {
    value: 'AUTO',
    label: '자동',
    description: '나만 바뀌는 일은 바로 하고, 다른 사람에게 닿는 일은 물어봐요',
  },
  { value: 'BYPASS', label: '바로 실행', description: '묻지 않고 실행해요' },
] as const satisfies readonly { value: AccessMode; label: string; description: string }[]

export const APPROVAL_FAILURE: Record<ApprovalFailure, string> = {
  resolved: '이미 답한 요청이에요',
  expired: '확인 시간이 지났어요. 다시 요청해 주세요.',
  failed: '답을 보내지 못했어요. 잠시 후 다시 시도해 주세요.',
}

export const CHAT_CREDITS = '크레딧이 모자라요. 충전하고 다시 보내 주세요.'

export const CHAT_CREDITS_CLOSED = '크레딧이 다 떨어졌어요. 결제는 아직 준비 중이에요.'

export const PLAN_REQUIRED_CLOSED =
  '이 기능은 상위 요금제에서 쓸 수 있어요. 결제는 아직 준비 중이에요.'

export const CHAT_BUSY = '지금 요청이 많아요. 잠시 후 다시 보내 주세요.'

export const STREAM_ERROR_TEXT: Record<string, string> = {
  NOT_CONFIGURED: '지금은 에이전트를 쓸 수 없어요. 잠시 뒤에 다시 해 주세요.',
  QUEUE_BUSY: '지금 요청이 많아요. 잠시 뒤에 다시 보내 주세요.',
  PLAN_REQUIRED: '요금제를 올리면 쓸 수 있어요.',
  FEATURE_DISABLED: CHAT_CREDITS,
  INSUFFICIENT_CREDITS: CHAT_CREDITS,
}

export const DEFAULT_STREAM_ERROR_TEXT = '작업을 이어가지 못했어요. 다시 보내 주세요.'

const queueBusyText = (sec: number) => `지금 요청이 많아요. ${sec}초 뒤에 다시 보내 주세요.`

const billingLockedText = (sec: number) =>
  `결제 정보를 정리하고 있어요. ${sec}초 뒤에 다시 보내 주세요.`

const CLOSED_STREAM_ERROR_TEXT: Record<string, string> = {
  PLAN_REQUIRED: PLAN_REQUIRED_CLOSED,
  FEATURE_DISABLED: CHAT_CREDITS_CLOSED,
  INSUFFICIENT_CREDITS: CHAT_CREDITS_CLOSED,
}

export const streamErrorText = (error: unknown, paymentsOpen = true) => {
  if (!(error instanceof ApiError)) return DEFAULT_STREAM_ERROR_TEXT
  const sec = error.code === 'QUEUE_BUSY' ? retryAfterSec(error) : undefined
  if (sec)
    return error.details?.reason === 'BILLING_LOCKED' ? billingLockedText(sec) : queueBusyText(sec)
  return (
    (paymentsOpen ? undefined : CLOSED_STREAM_ERROR_TEXT[error.code]) ??
    STREAM_ERROR_TEXT[error.code] ??
    DEFAULT_STREAM_ERROR_TEXT
  )
}
