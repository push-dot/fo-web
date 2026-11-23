/** Copy the renderer draws itself (push-be a2ui README "What the client does"); everything else comes in the surface. */
export const A2UI_COPY = {
  next: '다음',
  recommended: '추천',
  change: '변경',
  sayInstead: '바로 말해도 돼요',
  viewAll: '전체 보기',
  scoresOpen: '항목별 점수 보기',
  scoresClose: '항목별 점수 접기',
  upgrade: 'ULTRA로 업그레이드',
  share: '공유하기',
  bookmarked: '북마크함',
  diffSign: { '+': '추가', '-': '삭제' },
  todoState: { done: '완료', running: '진행 중', waiting: '대기' },
  question: '질문',
} as const

/** Example bars of a locked PushFit: never the real scores. */
export const LOCKED_FIT_SAMPLE = [
  { label: '기술 스택', score: 8 },
  { label: '경력', score: 6.5 },
  { label: '도메인', score: 5 },
] as const

/** The local actions a surface may dispatch besides `answer`. */
export const A2UI_ACTION = {
  answer: 'answer',
  openReview: 'open_review',
  share: 'share',
  resultAction: 'result_action',
  openPlan: 'open_plan',
  change: 'change',
  openPosting: 'open_posting',
} as const
