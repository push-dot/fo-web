import type { Posting, PostingDetail } from '@push/api-client'
import { career } from './fixtures-profiles'

export type PostingView = PostingDetail & { industry?: string; preferred?: string[] }

export const listing = (item: Partial<Posting> & Pick<Posting, 'id' | 'company' | 'title' | 'location' | 'createdAt'>): Posting => ({
  jobCategory: 'dev',
  imageUrl: null,
  skills: [],
  careerMin: 4,
  careerMax: 6,
  employmentType: 'full_time',
  deadline: null,
  bookmarked: false,
  applied: false,
  sourceUrl: null,
  ...item,
})

export const LISTINGS: Posting[] = [
  listing({
    id: 'p1',
    company: '모아페이',
    title: '백엔드 엔지니어 (Kotlin·Spring)',
    location: '서울 강남구',
    skills: ['Kotlin', 'Spring Boot', 'JPA', 'Kafka'],
    deadline: '2026-11-03',
    bookmarked: true,
    sourceUrl: 'https://careers.moapay.kr/jobs/1182',
    createdAt: '2026-10-20T12:00:00Z',
  }),
  listing({
    id: 'p2',
    company: '파도AI',
    title: '데이터 분석가',
    jobCategory: 'data',
    location: '서울 서초구',
    skills: ['SQL', 'Python'],
    careerMin: 0,
    careerMax: null,
    deadline: '2026-11-12',
    createdAt: '2026-10-20T11:00:00Z',
  }),
  listing({
    id: 'p3',
    company: '도토리증권',
    title: '서버 개발자 (Go)',
    location: '서울 영등포구',
    skills: ['Go', 'gRPC'],
    deadline: '2026-11-10',
    bookmarked: true,
    createdAt: '2026-10-20T10:00:00Z',
  }),
  listing({
    id: 'p9',
    company: '누리클라우드',
    title: '백엔드 개발자',
    location: '성남 판교',
    skills: ['Java', 'Spring Boot', 'MySQL'],
    careerMin: 1,
    careerMax: 3,
    deadline: '2026-11-03',
    sourceUrl: 'https://career.nuricloud.kr/jobs/208',
    bookmarked: true,
    createdAt: '2026-10-20T09:00:00Z',
  }),
  listing({
    id: 'p5',
    company: '그린티켓',
    title: '그로스 마케터',
    jobCategory: 'marketing',
    location: '서울 중구',
    careerMin: 1,
    careerMax: 3,
    deadline: '2026-11-14',
    createdAt: '2026-10-20T08:00:00Z',
  }),
  listing({
    id: 'p6',
    company: '새벽마켓',
    title: 'ML 엔지니어',
    location: '서울 송파구',
    skills: ['PyTorch', 'Python'],
    careerMin: 7,
    careerMax: 9,
    deadline: '2026-10-23',
    createdAt: '2026-10-20T07:00:00Z',
  }),
  listing({
    id: 'p7',
    company: '라온헬스',
    title: '안드로이드 개발자',
    location: '서울 강남구',
    skills: ['Kotlin', 'Android'],
    careerMin: 1,
    careerMax: 3,
    deadline: '2026-10-24',
    createdAt: '2026-10-20T06:00:00Z',
  }),
  listing({
    id: 'p8',
    company: '별빛게임즈',
    title: 'DevOps 엔지니어',
    location: '성남 판교',
    skills: ['Kubernetes', 'AWS'],
    deadline: '2026-10-25',
    bookmarked: true,
    createdAt: '2026-10-20T05:00:00Z',
  }),
  listing({
    id: 'p10',
    company: '하루랩스',
    title: 'iOS 개발자',
    location: '원격',
    skills: ['Swift', 'SwiftUI'],
    deadline: '2026-10-26',
    bookmarked: true,
    createdAt: '2026-10-20T04:00:00Z',
  }),
  listing({
    id: 'p11',
    company: '온새미로',
    title: '프로덕트 디자이너',
    jobCategory: 'design',
    location: '서울 마포구',
    skills: ['Figma'],
    deadline: '2026-10-27',
    createdAt: '2026-10-20T03:00:00Z',
  }),
  listing({
    id: 'p12',
    company: '바름로지스',
    title: '물류 데이터 엔지니어',
    jobCategory: 'data',
    location: '경기 이천',
    skills: ['Kafka', 'Python', 'AWS'],
    deadline: '2026-11-08',
    bookmarked: true,
    createdAt: '2026-10-20T02:00:00Z',
  }),
  listing({
    id: 'p13',
    company: '솔빛에너지',
    title: '프론트엔드 개발자',
    location: '서울 성동구',
    skills: ['React', 'TypeScript'],
    careerMin: 1,
    careerMax: 3,
    deadline: '2026-11-11',
    createdAt: '2026-10-20T01:00:00Z',
  }),
  listing({
    id: 'p14',
    company: '라온헬스',
    title: '백엔드 개발자 (Java)',
    location: '서울 강남구',
    skills: ['Java', 'JPA', 'AWS'],
    careerMin: 1,
    careerMax: 3,
    deadline: '2026-11-25',
    createdAt: '2026-10-15T01:00:00Z',
  }),
  listing({
    id: 'p15',
    company: '그린티켓',
    title: '플랫폼 엔지니어',
    location: '서울 중구',
    skills: ['Node.js', 'TypeScript'],
    careerMin: 1,
    careerMax: 3,
    deadline: '2026-11-28',
    createdAt: '2026-10-14T01:00:00Z',
  }),
]

export const POPULAR_ORDER = ['p12', 'p13', 'p1', 'p9', 'p3']

export const CATALOG_TOTALS: Record<string, number> = { 'data,dev': 312 }

export const SEARCH_BOARDS: Record<string, { postings: number; people: number; posts: number; postingIds: string[]; peopleIds: string[] }> = {
  백엔드: { postings: 48, people: 12, posts: 31, postingIds: ['p1', 'p9', 'p3', 'p12'], peopleIds: ['u-taeyoon', 'u-doyun'] },
}

export const JOB_BODY: Partial<PostingView> = {
  description: [
    '결제 승인·정산 API를 설계하고 운영해요',
    '하루 2,000만 건 거래를 안정적으로 처리하는 구조를 만들어요',
    '장애 대응과 모니터링 체계를 함께 개선해요',
  ].join('\n'),
  requirements: ['Kotlin 또는 Java로 서버를 3년 이상 개발해 본 분', 'Spring Boot, JPA 운영 경험', 'RDBMS 설계와 쿼리 튜닝 경험'],
  preferred: ['Kafka 등 메시지 큐 운영 경험', '결제·금융 도메인 경험'],
}

export const POSTING_DETAILS: Record<string, Partial<PostingView>> = {
  p1: {
    ...JOB_BODY,
    industry: '핀테크',
    workConditions: { 근무지: '서울 강남구 테헤란로 152', '근무 형태': '주 3일 출근 · 유연 근무' },
  },
  p9: {
    ...JOB_BODY,
    industry: '클라우드',
    workConditions: { 근무지: '성남 판교 테헤란로 152', '근무 형태': '주 3일 출근 · 유연 근무' },
  },
}

export const APP_POSTING_BODY: Partial<PostingView> = {
  industry: '핀테크',
  skills: ['Kotlin', 'Spring Boot', 'JPA', 'Kafka'],
  description: '결제 승인·취소 API를 설계하고 개발해요\n정산 배치의 성능과 정확도를 높여요',
  requirements: ['Kotlin 또는 Java로 4년 이상 서버 개발', 'Spring Boot, JPA 실무 경험'],
  preferred: ['결제·금융 도메인 경험', 'Kafka 등 메시징 시스템 운영 경험'],
  workConditions: { 근무: '주 5일, 유연 출퇴근 (코어 11–16시)', 보상: '연봉 협의 · 스톡옵션' },
}

export const APP_DEADLINE_DAYS = 13
