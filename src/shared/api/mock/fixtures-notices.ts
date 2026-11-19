import type { Application, WebNotification } from '@push/api-client'

export const SEED_NOTICES: WebNotification[] = [
  {
    id: 'n-stage',
    type: 'APPLICATION_STAGE',
    title: '지원 상태가 바뀌었어요',
    body: '모아페이 · 백엔드 엔지니어 → 면접',
    target: { kind: 'activity', id: 'applications' },
    readAt: null,
    createdAt: '2026-10-21T00:50:00.000Z',
  },
  {
    id: 'n-offer',
    type: 'OFFER',
    title: '오지현 님이 제안을 보냈어요',
    body: '결제 플랫폼팀 시니어 포지션으로 커피챗…',
    target: { kind: 'offer', id: 'offer-1' },
    readAt: null,
    createdAt: '2026-10-20T23:00:00.000Z',
  },
  {
    id: 'n-comment',
    type: 'COMMENT',
    title: '내 글에 댓글이 달렸어요',
    body: '김태윤 · 토큰 먼저 정하는 거 정말 공감해요',
    target: { kind: 'post', id: 'post-1' },
    readAt: null,
    createdAt: '2026-10-20T22:00:00.000Z',
  },
  {
    id: 'n-deadline',
    type: 'DEADLINE',
    title: '북마크한 공고가 3일 뒤 마감돼요',
    body: '파도AI · 데이터 분석가',
    target: { kind: 'posting', id: 'p2' },
    readAt: '2026-10-20T01:00:00.000Z',
    createdAt: '2026-10-20T00:00:00.000Z',
  },
]

export const EMPLOYER_NOTICES: WebNotification[] = [
  {
    id: 'n-applicant',
    type: 'APPLICATION_STAGE',
    title: '새 지원자가 있어요',
    body: '결제 승인 백엔드 엔지니어 · 박도윤',
    target: { kind: 'activity', id: 'applicants' },
    readAt: null,
    createdAt: '2026-10-21T00:40:00.000Z',
  },
  {
    id: 'n-ai',
    type: 'AI_DONE',
    title: '에이전트 작업이 끝났어요',
    body: '누리클라우드 공고 참고 · 백엔드 대화가 준비됐어요.',
    target: { kind: 'conversation', id: 'c-ref' },
    readAt: null,
    createdAt: '2026-10-20T23:00:00.000Z',
  },
]

export const application = (
  id: string,
  jobId: string,
  company: string,
  title: string,
  stage: Application['stage'],
  appliedAt: string,
  fitScore?: number,
): Application => ({ id, revision: 1, jobId, company, title, stage, appliedAt, createdAt: appliedAt, ...(fitScore === undefined ? {} : { fitScore }) })
