export const DELETE_RETENTION =
  '30일 안에 다시 로그인하면 계정이 복구되고, 30일이 지나면 이력서·서류·글·댓글이 모두 삭제돼요. 삭제된 뒤에는 되돌릴 수 없어요.'

export const DELETE_SUBSCRIPTION =
  '구독은 탈퇴해도 자동으로 해지되지 않아요. App Store나 Google Play에서 직접 해지해 주세요.'

export const DELETE_FAILED = '탈퇴하지 못했어요. 잠시 후 다시 시도해 주세요.'

type NotifyKey = 'notifyDeadline' | 'notifyOffer' | 'notifyComment' | 'notifyApplicationStage'

export const NOTIFY_ROWS: { key: NotifyKey; label: string; sub: string; personal: boolean }[] = [
  {
    key: 'notifyDeadline',
    label: '마감 임박 공고',
    sub: '북마크한 공고 마감 3일 전',
    personal: false,
  },
  { key: 'notifyOffer', label: '제안 받음', sub: '', personal: true },
  { key: 'notifyComment', label: '댓글과 답글', sub: '', personal: false },
  {
    key: 'notifyApplicationStage',
    label: '지원 상태 변경',
    sub: '기업이 내 지원 단계를 바꿨을 때',
    personal: true,
  },
]

export const WITHDRAW_TITLE = '회원 탈퇴할까요?'

export const WITHDRAW_CONFIRM = '탈퇴'

export const REAUTH = {
  title: '다시 로그인해 주세요',
  body: '탈퇴는 로그인한 지 10분 안에만 할 수 있어요. 다시 로그인한 뒤 탈퇴해 주세요.',
  close: '닫기',
  action: '다시 로그인',
} as const

export const ADMIN_TRANSFER = {
  title: '관리자를 먼저 넘겨 주세요',
  body: '관리자는 바로 탈퇴할 수 없어요. 담당자 관리에서 다른 담당자에게 관리자를 넘긴 뒤 탈퇴해 주세요.',
  close: '닫기',
  action: '담당자 관리로 가기',
} as const

export const BLOCKED_COPY = {
  title: '차단한 사람',
  back: '설정',
  intro: '차단한 사람은 나에게 제안이나 메시지를 보낼 수 없어요.',
  note: '차단을 풀면 이 사람이 보낸 지난 제안이 받은 제안 목록에 다시 보여요. 차단하거나 풀어도 상대에게는 알리지 않아요.',
  empty: '차단한 사람이 없어요.',
  unblock: '차단 해제',
  failed: '차단을 풀지 못했어요. 잠시 후 다시 시도해 주세요.',
  loadFailed: '차단한 사람을 불러오지 못했어요.',
} as const
