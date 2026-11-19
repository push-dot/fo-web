import type { Application, JobCategory } from '@push/api-client'
import { TAEYOON_CAREERS, TAEYOON_INTRO, TAEYOON_SKILLS } from './fixtures-profiles'

export type ApplicantSeed = {
  id: string
  stage: Application['stage']
  displayName: string
  headline: string | null
  jobCategory: JobCategory
  tenureYears: number
  appliedAt: string
  documents: { id: string; title: string; content: string; pages?: number }[]
  /** True until a member opens the applicant. Omitted means already seen. */
  isNew?: boolean
  /** CURRENT is the live profile. SUBMITTED is the snapshot taken at apply time. */
  profileSource?: 'SUBMITTED' | 'CURRENT'
  /** Hub profile fields the applicant detail serves; absent = an applicant with no profile data. */
  profile?: { email: string; headline: string; careers: typeof TAEYOON_CAREERS; skills: string[]; hubProfileId: string | null }
}

export const PROFILE_DOC = { title: '이력서 (프로필)', content: TAEYOON_INTRO }

export const APPLICANT_SEEDS: ApplicantSeed[] = [
  {
    id: 'app-2',
    stage: 'SCREENING',
    displayName: '김태윤',
    headline: '모아페이와 같은 결제 도메인',
    jobCategory: 'dev',
    tenureYears: 5,
    appliedAt: '2026-10-20T01:00:00.000Z',
    documents: [
      { id: 'doc-3', ...PROFILE_DOC },
      { id: 'doc-4', title: '포트폴리오.pdf', content: '', pages: 14 },
    ],
    profile: {
      email: 'taeyoon.kim@gmail.com',
      headline: '백엔드 엔지니어',
      careers: TAEYOON_CAREERS,
      skills: TAEYOON_SKILLS.slice(0, 7),
      hubProfileId: 'u-taeyoon',
    },
  },
  {
    id: 'app-3',
    stage: 'APPLIED',
    displayName: '정민재',
    headline: null,
    jobCategory: 'dev',
    tenureYears: 5,
    appliedAt: '2026-10-19T01:00:00.000Z',
    isNew: true,
    documents: [{ id: 'doc-5', title: '이력서.pdf', content: '' }],
  },
  {
    id: 'app-4',
    stage: 'INTERVIEW',
    displayName: '윤채원',
    headline: null,
    jobCategory: 'data',
    tenureYears: 5,
    appliedAt: '2026-10-18T01:00:00.000Z',
    profileSource: 'SUBMITTED',
    documents: [{ id: 'doc-6', title: '이력서 (프로필)', content: '' }],
  },
  {
    id: 'app-1',
    stage: 'APPLIED',
    displayName: '박도윤',
    headline: null,
    jobCategory: 'dev',
    tenureYears: 3,
    appliedAt: '2026-10-15T01:00:00.000Z',
    isNew: true,
    documents: [
      { id: 'doc-1', title: '이력서 (프로필)', content: '' },
      { id: 'doc-2', title: '경력기술서.pdf', content: '' },
    ],
  },
  {
    id: 'app-5',
    stage: 'REJECTED',
    displayName: '서준호',
    headline: null,
    jobCategory: 'dev',
    tenureYears: 6,
    appliedAt: '2026-10-12T01:00:00.000Z',
    documents: [
      { id: 'doc-7', title: '이력서.pdf', content: '' },
      { id: 'doc-8', title: '포트폴리오.pdf', content: '' },
    ],
  },
]

export const DRAFT = {
  title: '결제 승인 백엔드 엔지니어 (Kotlin)',
  description: [
    '하루 2,000만 건 결제 승인 API를 설계하고 성능을 개선해요',
    '거래액 증가에 맞춰 확장 가능한 구조로 바꿔요',
    '장애 대응 체계와 모니터링을 함께 만들어요',
  ].join('\n'),
  requirements: ['Kotlin 또는 Java 서버 개발 4년 이상', '대용량 트래픽 API 운영 경험', 'RDBMS 설계와 쿼리 튜닝 경험'],
  preferred: ['결제·금융 도메인 경험', 'Kafka 등 메시지 큐 운영 경험'],
  workConditions: { 근무: '주 3일 출근 · 유연 근무', 근무지: '서울 강남구 테헤란로 152' },
}
