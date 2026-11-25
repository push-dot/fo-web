import { DRAFT } from './fixtures-applicants'

export const DRAFT_REPLY = [
  '결제 승인 API를 키울 4–6년차 기준으로 썼어요. 참고 공고의 표현은 옮기지 않고, 모아페이 거래 규모를 넣었어요.',
  '```posting-draft',
  JSON.stringify(DRAFT, null, 2),
  '```',
  '등록하기 전에 공고 편집에서 고칠 수 있어요. 연봉 범위를 넣을까요?',
].join('\n')

export type ChatSeed = {
  id: string
  title: string
  updatedAt: string
  postingId?: string
  messages: ['USER' | 'ASSISTANT', string][]
  list?: {
    status: 'NEEDS_APPROVAL' | 'RUNNING' | 'DONE'
    queuePosition: number | null
    lastLine: string | null
    author: string
  }
}

export const CHAT_SEEDS: ChatSeed[] = [
  {
    id: 'c-ref',
    title: '누리클라우드 공고 참고 · 백엔드',
    updatedAt: '2026-10-21T00:59:40.000Z',
    postingId: 'p9',
    messages: [
      ['USER', '이 공고 참고해서 우리 회사 백엔드 공고 만들어 줘'],
      [
        'ASSISTANT',
        [
          '좋아요. 먼저 모아페이를 찾아보고, 참고 공고와 비교해서 필요한 걸 여쭤볼게요.',
          '모아페이는 결제 승인과 정산을 직접 운영하고, 최근 거래액이 빠르게 늘고 있어요. 참고 공고는 1–3년차 대상이라 그대로 쓰면 연차가 맞지 않을 수 있어요.',
          '이번에 가장 필요한 사람은 누구예요?',
          '1. 결제 승인 API를 키울 사람\n2. 정산 파이프라인을 맡을 사람\n3. 둘 다 볼 수 있는 시니어\n4. 직접 말하기',
        ].join('\n\n'),
      ],
    ],
  },
  {
    id: 'c-review',
    title: '백엔드 지원자 김태윤 서류 검토',
    updatedAt: '2026-10-20T08:00:00.000Z',
    list: { status: 'RUNNING', queuePosition: 3, lastLine: '이력서 읽기 · 김서준_이력서.pdf', author: '한지호' },
    messages: [
      ['USER', '이 지원자 서류 검토해 줘'],
      [
        'ASSISTANT',
        [
          '서류 전체는 공고와 잘 맞아요. 다만 아래 세 곳은 면접에서 직접 확인해 보는 게 좋아요.',
          '확인 필요 · “p99 420ms → 180ms”의 본인 역할\n성과 수치는 구체적인데, 무엇을 직접 바꿨는지 설명이 같은 연차 서류보다 짧아요.',
          '확인 필요 · Kafka 정산 파이프라인\n문장 구조는 고급인데, 처리량·장애 사례 같은 빈칸 내용이 구체적이지 않아요.',
          '근거 충분 · 결제 승인 API 운영 4년\n기간, 트래픽 규모, 장애 회고가 서로 맞아요.',
          '합격·불합격은 담당자가 정해요. AI는 확인할 부분만 짚어요.',
        ].join('\n\n'),
      ],
    ],
  },
  {
    id: 'c-interview',
    title: '결제 플랫폼 시니어 면접 질문',
    updatedAt: '2026-10-20T07:00:00.000Z',
    list: { status: 'NEEDS_APPROVAL', queuePosition: null, lastLine: '3명을 면접 단계로 옮길까요?', author: '이민아' },
    messages: [
      ['USER', '면접 질문 만들어 줘'],
      [
        'ASSISTANT',
        [
          '면접관 시점에서 서류의 역량이 사실인지 확인하는 질문 5개예요. 확인 필요였던 부분부터 넣었어요.',
          '1. p99를 180ms로 줄일 때 직접 바꾼 코드나 설정을 하나 골라 설명해 주세요.\n확인할 점 · 팀 성과와 본인 기여를 구분하는지, 측정 방법을 아는지',
          '2. 정산 파이프라인에서 메시지가 중복으로 들어왔을 때 어떻게 막았나요?\n확인할 점 · 멱등성 처리 방식, 실제 장애 사례가 있는지',
          '3. Kafka 컨슈머 지연이 났던 날을 시간순으로 말해 주세요.\n확인할 점 · 모니터링 지표와 대응 순서가 구체적인지',
          '4. 승인 API를 다시 설계한다면 가장 먼저 바꿀 것은 무엇인가요?\n확인할 점 · 지금 구조의 한계를 스스로 아는지',
          '5. 4년 동안 가장 크게 실패한 배포는 무엇이었나요?\n확인할 점 · 회고 습관, 책임 범위',
        ].join('\n\n'),
      ],
    ],
  },
  {
    id: 'c-draft',
    title: '데이터 엔지니어 새 공고',
    updatedAt: '2026-10-20T06:00:00.000Z',
    messages: [],
  },
]
