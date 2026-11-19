import type { Comment, Post } from '@push/api-client'
import { career } from './fixtures-profiles'

export const placeholder = (hue: number) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400"><rect width="640" height="400" fill="hsl(${hue} 60% 92%)"/></svg>`,
  )}`

export const DESIGN_SYSTEM_BODY =
  '토큰부터 정하고 컴포넌트는 나중에. 처음 3주 동안 버튼부터 만들었다가 색이 세 번 바뀌면서 전부 다시 만들었어요. 그 뒤로는 색·글자·간격 토큰을 먼저 합의하고, 화면 세 개를 토큰만으로 그려 본 다음에 컴포넌트를 뽑았어요.'

export const EMPLOYER_POST: Post = {
  id: 'post-emp',
  author: { id: 'u-emp', displayName: '모아페이', avatarUrl: null, employer: true, companyName: '모아페이' },
  category: 'career',
  title: '결제 플랫폼팀이 일하는 방식을 소개해요',
  body: '주 3일 출근, 장애 회고는 이름 없이. 백엔드 엔지니어를 찾고 있어요. 궁금한 점은 댓글로 남겨 주세요.',
  imageUrls: [],
  commentCount: 3,
  viewCount: 41,
  createdAt: '2026-10-21T00:59:30.000Z',
}

export const DESIGN_SYSTEM_POST: Post = {
  id: 'post-1',
  author: { id: 'u-haeun', displayName: '이하은', avatarUrl: null },
  category: 'dev',
  title: '디자인 시스템을 0부터 만들면서 배운 것',
  body: DESIGN_SYSTEM_BODY,
  imageUrls: [placeholder(250), placeholder(160)],
  commentCount: 18,
  viewCount: 1200,
  createdAt: '2026-10-20T23:00:00.000Z',
}

export const FEED: Post[] = [
  EMPLOYER_POST,
  DESIGN_SYSTEM_POST,
  {
    id: 'post-2',
    author: { id: 'u-yerin', displayName: '오예린', avatarUrl: null },
    category: 'career',
    title: '4년차 마케터 이직 준비 후기',
    body: '포트폴리오를 숫자 위주로 바꿨더니 서류 통과율이 확 올랐어요.',
    imageUrls: [],
    commentCount: 31,
    viewCount: 2400,
    createdAt: '2026-10-20T20:00:00.000Z',
  },
  {
    id: 'post-3',
    author: { id: 'u-minjae', displayName: '정민재', avatarUrl: null },
    category: 'coffeechat',
    title: '쿠버네티스 비용 줄이기 커피챗 하실 분',
    body: '판교 근처에서 30분 정도 이야기 나눠요.',
    imageUrls: [],
    commentCount: 6,
    viewCount: 380,
    createdAt: '2026-10-20T00:00:00.000Z',
  },
]

export const SEOJUN = { id: 'u1', displayName: '김서준', avatarUrl: null }

export const myPost = (id: string, category: Post['category'], title: string, body: string, commentCount: number, viewCount: number, createdAt: string): Post => ({
  id,
  author: SEOJUN,
  category,
  title,
  body,
  imageUrls: [],
  commentCount,
  viewCount,
  createdAt,
})

export const MY_POSTS: Post[] = [
  myPost('post-me-1', 'dev', '정산 배치를 Kafka 스트림으로 바꾼 이야기', '3시간 걸리던 배치를 20분으로 줄이기까지 겪은 일을 정리했어요.', 12, 540, '2026-10-18T00:00:00.000Z'),
  myPost('post-me-2', 'career', '4년차 백엔드, 이직 준비 어디서부터 할까요', '경력기술서를 처음 써 보는데, 숫자를 어디까지 넣어야 할지 고민이에요.', 8, 260, '2026-10-14T00:00:00.000Z'),
  myPost('post-me-3', 'coffeechat', '판교 점심 커피챗 하실 분', '결제·정산 도메인 이야기 나누실 분 편하게 댓글 주세요.', 5, 90, '2026-10-07T00:00:00.000Z'),
]

export const MY_FOLLOWS = ['u-taeyoon', 'u-haeun', 'u-jiwoo', 'u-minjae', 'u-junho']

export const COMMENT_THREADS: [string, Comment[]][] = [
  [
    'post-1',
    [
      {
        id: 'c1',
        author: { id: 'u-taeyoon', displayName: '김태윤', avatarUrl: null },
        body: '토큰 먼저 정하는 거 정말 공감해요. 저희도 같은 실수를 했어요.',
        parentId: null,
        createdAt: '2026-10-21T00:00:00.000Z',
      },
      {
        id: 'c2',
        author: { id: 'u-haeun', displayName: '이하은', avatarUrl: null },
        body: '맞아요! 다음 글에서 토큰 이름 정한 방법도 써 볼게요.',
        parentId: 'c1',
        createdAt: '2026-10-21T00:10:00.000Z',
      },
      {
        id: 'c3',
        author: { id: 'u-emp', displayName: '모아페이', avatarUrl: null, employer: true, companyName: '모아페이' },
        body: '좋은 글 감사해요. 저희 팀도 디자인 시스템을 만들고 있어요.',
        parentId: null,
        createdAt: '2026-10-21T00:30:00.000Z',
      },
    ],
  ],
  [
    'post-emp',
    [
      {
        id: 'c4',
        author: { id: 'u1', displayName: '김서준', avatarUrl: null },
        body: '응원해요',
        parentId: null,
        createdAt: '2026-10-20T03:00:00.000Z',
      },
    ],
  ],
]
