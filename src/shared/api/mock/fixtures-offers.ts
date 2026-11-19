import type { Offer, OfferMessage } from '@push/api-client'

export const party = (id: string, displayName: string, companyName: string | null, headline: string) => ({
  id,
  displayName,
  avatarUrl: null,
  companyName,
  headline,
})

export const ME_PARTY = party('u1', '김서준', null, '')

export const RECEIVED_OFFERS: Offer[] = [
  {
    id: 'offer-1',
    sender: party('u-jihyun', '오지현', '모아페이', '결제 플랫폼팀 채용 담당'),
    recipient: ME_PARTY,
    message: '안녕하세요, 서준 님! 결제 승인 API 개선 경험을 인상 깊게 봤어요. 결제 플랫폼팀 시니어 포지션으로 30분 커피챗 어떠세요?',
    posting: { id: 'p16', company: '모아페이', title: '결제 플랫폼 시니어 엔지니어', imageUrl: null },
    status: 'ACCEPTED',
    readAt: '2026-10-21T04:20:00.000Z',
    createdAt: '2026-10-21T04:12:00.000Z',
  },
  {
    id: 'offer-3',
    sender: party('u-doyun', '박도윤', '하루랩스', 'iOS 개발자'),
    recipient: ME_PARTY,
    message:
      '안녕하세요, 서준 님! 주말 사이드 프로젝트를 같이 하실 백엔드 개발자를 찾고 있어요. 운동 기록 앱인데, API 설계를 맡아 주시면 좋겠어요. 관심 있으시면 편하게 답장 주세요.',
    posting: null,
    status: 'SENT',
    readAt: null,
    createdAt: '2026-10-20T11:14:00.000Z',
  },
  {
    id: 'offer-4',
    sender: party('u-jiwoo', '최지우', '파도AI', '데이터 엔지니어'),
    recipient: ME_PARTY,
    message: '정산 데이터 파이프라인 경험을 듣고 싶어요. 저희 팀 데이터 플랫폼 이야기도 나눠 드릴게요.',
    posting: null,
    status: 'DECLINED',
    readAt: '2026-10-14T03:00:00.000Z',
    createdAt: '2026-10-14T02:03:00.000Z',
  },
  {
    id: 'offer-8',
    sender: party('u-harin', '정하린', '누리클라우드', '플랫폼팀 리드'),
    recipient: ME_PARTY,
    message: '안녕하세요, 서준 님! 멀티 테넌트 과금 시스템을 새로 만들고 있어요. 결제 쪽 경험을 살려 같이 만들어 보실래요?',
    posting: null,
    status: 'SENT',
    readAt: '2026-10-09T02:00:00.000Z',
    archivedAt: '2026-10-10T00:00:00.000Z',
    createdAt: '2026-10-09T01:20:00.000Z',
  },
]

export const BLOCK_SEEDS = [
  { user: party('u-jihyun', '오지현', '모아페이', '결제 플랫폼팀 채용 담당'), createdAt: '2026-11-07T01:00:00.000Z' },
  { user: party('u-minjae-h', '한민재', null, ''), createdAt: '2026-10-03T01:00:00.000Z' },
]

export const CANT_SEND_REPLY = { id: 'om-3', body: '좋아요, 수요일 4시에 뵐게요', createdAt: '2026-10-21T05:53:00.000Z' }

export const sentOffer = (id: string, recipient: Offer['recipient'], message: string, status: Offer['status'], createdAt: string): Offer => ({
  id,
  sender: ME_PARTY,
  recipient,
  message,
  posting: null,
  status,
  readAt: status === 'SENT' ? null : createdAt,
  createdAt,
})

export const SENT_OFFERS: Offer[] = [
  sentOffer('offer-2', party('u-minjae', '정민재', null, ''), '쿠버네티스 비용 이야기를 나누고 싶어요.', 'READ', '2026-10-19T01:00:00.000Z'),
  sentOffer('offer-6', party('u-sua', '한수아', null, ''), '결제 화면 설계 경험이 궁금해요.', 'SENT', '2026-10-18T01:00:00.000Z'),
  sentOffer('offer-7', party('u-chaewon', '윤채원', null, ''), '모델 서빙 구조를 배우고 싶어요.', 'DECLINED', '2026-10-12T01:00:00.000Z'),
]

export const reply = (id: string, offerId: string, sender: OfferMessage['sender'], body: string, createdAt: string): OfferMessage => ({
  id,
  offerId,
  sender,
  body,
  createdAt,
})

export const JIHYUN = { id: 'u-jihyun', displayName: '오지현', avatarUrl: null }
export const ME = { id: 'u1', displayName: '김서준', avatarUrl: null }

export const OFFER_THREADS: [string, OfferMessage[]][] = [
  [
    'offer-1',
    [
      reply('om-1', 'offer-1', ME, '제안 감사합니다! 다음 주 화요일이나 수요일 오후 괜찮으세요?', '2026-10-21T05:40:00.000Z'),
      reply('om-2', 'offer-1', JIHYUN, '수요일 오후 4시 어떠세요? 강남역 근처로 갈게요.', '2026-10-21T05:52:00.000Z'),
    ],
  ],
]
