import type { Application, Comment, Company, CompanyMember, Consent, EmploymentType, GoogleIntegration, JobCategory, Offer, OfferMessage, Post, Posting, PostingDetail, Profile, Session, Settings, UserLink, WebNotification } from '@push/api-client'
import { LEGAL_VERSION } from '@push/shared'
import { sessionStore } from '../../auth/session'
import { isWebView } from '../../lib/bridge'
import { APP_DEADLINE_DAYS, APP_POSTING_BODY, APPLICANT_SEEDS, APPLICATIONS, BLOCK_SEEDS, CALENDAR_EVENTS, CANT_SEND_REPLY, CATALOG_TOTALS, COMMENT_THREADS, EMPLOYER_NOTICES, FEED, HUB_PROFILES, LISTINGS, ME_PROFILE, MY_FOLLOWS, MY_POSTS, OFFER_THREADS, POPULAR_ORDER, POSTING_DETAILS, RECEIVED_OFFERS, SEED_LINKS, SEED_NOTICES, SEED_SOURCES, SENT_OFFERS, type PostingView, type SeedSource } from './fixtures'

export type { PostingView }

export type Fit = {
  document: string
  score: number
  parts: { label: string; value: number }[]
  weakness: string
}

export const mockFit: Fit = {
  document: '김서준_백엔드_이력서_2026',
  score: 6.9,
  parts: [
    { label: '기술 스택', value: 7.5 },
    { label: '경험 연관성', value: 7 },
    { label: '경력 수준', value: 8 },
    { label: '키워드', value: 4.5 },
    { label: '도메인', value: 5 },
  ],
  weakness: 'Kafka 운영 경험과 부하 테스트 근거가 부족해요',
}

export const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

export const MEMBER_EMAIL = 'mina.lee@moapay.kr'

export type MockPersona = 'personal' | 'employer' | 'employer-pro' | 'employer-ultra' | 'employer-new'

export const PERSONAS: MockPersona[] = ['personal', 'employer', 'employer-pro', 'employer-ultra', 'employer-new']

export let persona: MockPersona | null = null
export const TAKEN_EMAILS = ['taken@push.app', 'seojun.kim@gmail.com']

export const mockPersona = () => persona

export const setMockPersona = (value: string | null | undefined) => {
  persona = PERSONAS.find((item) => item === value) ?? null
}

export const MOCK_SWITCHES = [
  'applicant-move-fail',
  'apply-fail',
  'apply-no-docs',
  'apply-slow',
  'auth-exchange-wait',
  'billing-ledger',
  'blocks-empty',
  'blocks-list',
  'bookmarks-empty',
  'calendar-google-off',
  'chat-approve',
  'chat-draft',
  'chat-limit',
  'chat-member',
  'chat-multiple',
  'chat-queue',
  'chat-sections',
  'chat-tool',
  'chat-turns',
  'chat-writing',
  'docs-delete-fail',
  'docs-deleted',
  'docs-empty',
  'docs-uploading',
  'follows-empty',
  'home-latest-error',
  'inbox-archive',
  'inbox-block',
  'inbox-cant-send',
  'inbox-empty',
  'inbox-report',
  'invite-accept-wait',
  'invite-expired',
  'invite-invalid',
  'invite-other-account',
  'links-empty',
  'load-fail',
  'login-code-expired',
  'login-code-limit',
  'login-code-wrong',
  'login-phone-taken',
  'login-social-fail',
  'notif-empty',
  'offer-blocked',
  'payments-disabled',
  'phone-sent',
  'posts-empty',
  'profile-save-fail',
  'pw-reset-expired',
  'role-member',
  'signup-consent',
  'signup-taken-employer',
  'slow',
  'social-error',
  'verify-expired',
] as const

export type MockSwitch = (typeof MOCK_SWITCHES)[number]

export let switches = new Set<MockSwitch>()

export const setMockSwitches = (value: string | null | undefined) => {
  const names = (value ?? '').split(',').map((part) => part.trim())
  switches = new Set(MOCK_SWITCHES.filter((name) => names.includes(name)))
}

export const mockSwitch = (name: MockSwitch) => switches.has(name) && !isWebView()

export const HOLD_MS = 20_000

export const hold = () => new Promise((resolve) => setTimeout(resolve, HOLD_MS))

export const failure = (status: number, code: string, message: string, details?: Record<string, unknown>) =>
  json(status, { error: { code, message, ...(details ? { details } : {}) } })

export const internalError = () => failure(500, 'INTERNAL', '잠시 후 다시 시도해 주세요')

export const companyPersona = (kind: MockPersona | null) => kind === 'employer' || kind === 'employer-pro' || kind === 'employer-ultra'

export const memberView = () => companyPersona(persona) && (mockSwitch('role-member') || mockSwitch('chat-member'))

export const MEMBER_USER = { id: 'u-member', displayName: '한지호', email: 'jiho.han@moapay.kr' }

export const mockSession = (kind: MockPersona): Session => {
  if (companyPersona(kind) && memberView()) {
    return {
      accessToken: 'mock-access',
      refreshToken: 'mock-refresh',
      expiresIn: 900,
      user: {
        id: MEMBER_USER.id,
        displayName: MEMBER_USER.displayName,
        locale: 'ko',
        accountType: 'EMPLOYER',
        companyId: 'co-1',
        companyRole: 'MEMBER',
      },
    }
  }
  if (companyPersona(kind)) {
    return {
      accessToken: 'mock-access',
      refreshToken: 'mock-refresh',
      expiresIn: 900,
      user: {
        id: 'u1',
        displayName: '이민아',
        locale: 'ko',
        accountType: 'EMPLOYER',
        companyId: 'co-1',
        companyRole: 'ADMIN',
      },
    }
  }
  if (kind === 'employer-new') {
    return {
      accessToken: 'mock-access',
      refreshToken: 'mock-refresh',
      expiresIn: 900,
      user: {
        id: 'u1',
        displayName: MEMBER_EMAIL,
        locale: 'ko',
        accountType: 'EMPLOYER',
        companyId: null,
        companyRole: null,
      },
    }
  }
  return {
    accessToken: 'mock-access',
    refreshToken: 'mock-refresh',
    expiresIn: 900,
    user: {
      id: 'u1',
      displayName: '김서준',
      locale: 'ko',
      accountType: 'PERSONAL',
      companyId: null,
      companyRole: null,
    },
  }
}

export const loginPersona = (email: string): MockPersona => {
  if (email.startsWith('employer-new')) return 'employer-new'
  if (email.startsWith('employer')) return 'employer'
  return persona ?? 'personal'
}

export const readJson = async (input: RequestInfo | URL, init?: RequestInit) => {
  try {
    if (input instanceof Request) return (await input.clone().json()) as Record<string, unknown>
    if (typeof init?.body === 'string') return JSON.parse(init.body) as Record<string, unknown>
    return {}
  } catch {
    return {}
  }
}

export const readForm = async (input: RequestInfo | URL, init?: RequestInit) => {
  try {
    if (input instanceof Request) return await input.clone().formData()
    if (typeof FormData !== 'undefined' && init?.body instanceof FormData) return init.body
  } catch {
    return null
  }
  return null
}

export const matches = (pathname: string, suffix: string) => pathname === suffix || pathname.endsWith(suffix)

export const DAY_MS = 86_400_000
export const DEADLINE_ORIGIN = Date.parse('2026-10-21T00:00:00Z')
export const HOME_RAIL_SIZE = 5

export const listings: Posting[] = LISTINGS.map((item) => ({ ...item }))

export const flags = new Map(listings.map((item) => [item.id, { bookmarked: item.bookmarked, applied: item.applied }]))

export const signedOf = (input: RequestInfo | URL, init?: RequestInit) =>
  new Headers(input instanceof Request ? input.headers : init?.headers).has('Authorization')

export const present = (item: Posting, signed: boolean): Posting => {
  const flag = flags.get(item.id)
  if (!signed) return { ...item, bookmarked: false, applied: false }
  return flag ? { ...item, bookmarked: flag.bookmarked, applied: flag.applied } : item
}

export const localDateIn = (days: number) => {
  const at = new Date(Date.now() + days * DAY_MS)
  return `${at.getFullYear()}-${String(at.getMonth() + 1).padStart(2, '0')}-${String(at.getDate()).padStart(2, '0')}`
}

export const detailFor = (item: Posting, signed: boolean): PostingView => {
  const shown = present(item, signed)
  if (isWebView() && shown.id === 'p1') return { ...shown, ...APP_POSTING_BODY, deadline: localDateIn(APP_DEADLINE_DAYS) } as PostingView
  const detail = POSTING_DETAILS[shown.id]
  if (detail) return { ...shown, ...detail } as PostingView
  return {
    ...shown,
    description: `${shown.company}에서 ${shown.title}를 채용해요`,
    requirements: shown.skills,
    preferred: [],
    workConditions: {},
  }
}

export type CompanyPosting = PostingDetail &
  Required<Pick<PostingDetail, 'status' | 'applicantCount' | 'newApplicantCount' | 'createdBy' | 'draftSource'>> & {
    revision: number
    closedAt: string | null
  }

export const JOB_CATEGORY_KEYS = ['dev', 'data', 'design', 'plan', 'marketing', 'sales', 'hr', 'ops'] as const
export const EMPLOYMENT_TYPE_KEYS = ['full_time', 'contract', 'intern', 'freelance', 'dispatch'] as const
export const APPLICATION_STAGES = [
  'DISCOVERED',
  'PREPARING',
  'READY',
  'APPLIED',
  'SCREENING',
  'INTERVIEW',
  'OFFER',
  'ACCEPTED',
  'REJECTED',
  'WITHDRAWN',
] as const
export const TERMINAL_APPLICANT_STAGES = new Set<Application['stage']>(['REJECTED', 'ACCEPTED', 'WITHDRAWN'])

export const asJobCategory = (value: unknown): JobCategory => JOB_CATEGORY_KEYS.find((key) => key === value) ?? 'dev'

export const asEmploymentType = (value: unknown): EmploymentType => EMPLOYMENT_TYPE_KEYS.find((key) => key === value) ?? 'full_time'

export const asStage = (value: unknown) => APPLICATION_STAGES.find((stage) => stage === value) ?? null

export const stringList = (value: unknown) => (Array.isArray(value) ? value.map(String) : [])

export const recordOf = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}

export const careerMinOf = (value: unknown) => {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export const deadlineOf = (value: unknown) => (typeof value === 'string' && value.trim() ? value : null)

export const companyPosting = (patch: Partial<CompanyPosting> & Pick<CompanyPosting, 'id' | 'title'>): CompanyPosting => ({
  company: '모아페이',
  jobCategory: 'dev',
  imageUrl: null,
  skills: [],
  careerMin: 5,
  careerMax: null,
  location: '서울 강남구',
  employmentType: 'full_time',
  deadline: '2026-11-30',
  bookmarked: false,
  applied: false,
  sourceUrl: null,
  createdAt: '2026-10-21T00:00:00.000Z',
  description: '결제 승인 API를 설계해요',
  requirements: ['서버 개발 5년'],
  preferred: ['금융 도메인'],
  workConditions: { 조건: '주 5일' },
  revision: 1,
  closedAt: null,
  status: 'OPEN',
  applicantCount: 0,
  newApplicantCount: 0,
  createdBy: null,
  draftSource: null,
  ...patch,
})

export const POSTING_DRAFT_BODY: Partial<CompanyPosting> = {
  description: [
    '하루 2,000만 건 결제 승인 API를 설계하고 성능을 개선해요',
    '거래액 증가에 맞춰 확장 가능한 구조로 바꿔요',
    '장애 대응 체계와 모니터링을 함께 만들어요',
  ].join('\n'),
  requirements: ['Kotlin 또는 Java 서버 개발 4년 이상', '대용량 트래픽 API 운영 경험', 'RDBMS 설계와 쿼리 튜닝 경험'],
  preferred: ['결제·금융 도메인 경험', 'Kafka 등 메시지 큐 운영 경험'],
  workConditions: { 근무: '주 3일 출근 · 유연 근무', 근무지: '서울 강남구 테헤란로 152' },
}

export const companyPostings: CompanyPosting[] = [
  companyPosting({
    id: 'job-1',
    title: '결제 승인 백엔드 엔지니어 (Kotlin)',
    careerMin: 4,
    careerMax: 6,
    location: '서울 강남구 테헤란로 152',
    deadline: '2026-11-03',
    skills: ['Kotlin', 'Spring Boot', 'MySQL', 'Kafka'],
    createdAt: '2026-10-20T01:00:00.000Z',
    applicantCount: 38,
    newApplicantCount: 6,
    createdBy: { displayName: '이민아' },
    ...POSTING_DRAFT_BODY,
  }),
  companyPosting({
    id: 'job-2',
    title: '결제 플랫폼 시니어 엔지니어',
    careerMin: 7,
    careerMax: 9,
    deadline: '2026-11-20',
    createdAt: '2026-10-19T01:00:00.000Z',
    applicantCount: 14,
    newApplicantCount: 2,
    createdBy: { displayName: '한지호' },
  }),
  companyPosting({
    id: 'job-3',
    title: '정산 데이터 엔지니어',
    careerMin: 4,
    careerMax: 6,
    deadline: null,
    createdAt: '2026-10-18T01:00:00.000Z',
    applicantCount: 21,
  }),
  companyPosting({
    id: 'job-4',
    title: '데이터 엔지니어',
    jobCategory: 'data',
    careerMin: 4,
    careerMax: 6,
    deadline: null,
    createdAt: '2026-10-20T00:00:00.000Z',
    status: 'DRAFT',
    draftSource: 'AGENT',
  }),
  companyPosting({
    id: 'job-5',
    title: 'iOS 개발자',
    careerMin: 1,
    careerMax: 3,
    deadline: '2026-09-30',
    closedAt: '2026-09-30T00:00:00.000Z',
    createdAt: '2026-09-01T00:00:00.000Z',
    status: 'CLOSED',
    applicantCount: 52,
  }),
]

export let companyPostingSeq = companyPostings.length

export const employerOwnsPostings = () =>
  persona === 'employer' || persona === 'employer-pro' || persona === 'employer-ultra' || persona === 'employer-new'

export const toCard = (item: CompanyPosting): Posting => ({
  id: item.id,
  company: item.company,
  title: item.title,
  jobCategory: item.jobCategory,
  imageUrl: item.imageUrl,
  skills: item.skills,
  careerMin: item.careerMin,
  careerMax: item.careerMax,
  location: item.location,
  employmentType: item.employmentType,
  deadline: item.deadline,
  bookmarked: item.bookmarked,
  applied: item.applied,
  sourceUrl: item.sourceUrl,
  createdAt: item.createdAt,
  revision: item.revision,
  closedAt: item.closedAt,
})

export type ApplicantRecord = {
  application: Application
  seed: (typeof APPLICANT_SEEDS)[number]
  seen: boolean
}

export const applicantRecord = (seed: (typeof APPLICANT_SEEDS)[number]): ApplicantRecord => ({
  application: {
    id: seed.id,
    revision: 1,
    jobId: 'job-1',
    company: '모아페이',
    title: '결제 승인 백엔드 엔지니어 (Kotlin)',
    stage: seed.stage,
    appliedAt: seed.appliedAt,
    createdAt: seed.appliedAt,
  },
  seed,
  seen: seed.isNew !== true,
})

export const isPdf = (title: string) => title.endsWith('.pdf')

export const documentKinds = (seed: ApplicantRecord['seed']) => [
  ...(seed.documents.some((item) => !isPdf(item.title)) ? (['PROFILE'] as const) : []),
  ...(seed.documents.some((item) => isPdf(item.title)) ? (['PDF'] as const) : []),
]

export const applicantSummary = ({ application, seed, seen }: ApplicantRecord) => ({
  applicationId: application.id,
  applicant: { displayName: seed.displayName, headline: seed.headline, jobCategory: seed.jobCategory, tenureYears: seed.tenureYears, avatarUrl: null },
  stage: application.stage,
  appliedAt: application.appliedAt ?? application.createdAt,
  documentKinds: documentKinds(seed),
  documents: seed.documents.map((item) => ({ title: item.title, pages: item.pages ?? null })),
  isNew: !seen,
})

export const applicantDetail = ({ application, seed }: ApplicantRecord) => ({
  application,
  documents: seed.documents.filter((item) => !isPdf(item.title)).map((item) => ({ id: item.id, title: item.title.replace(' (프로필)', ''), content: item.content })),
  files: seed.documents
    .filter((item) => isPdf(item.title))
    .map((item) => ({ id: item.id, fileName: item.title, mimeType: 'application/pdf', size: 482_000, pageCount: item.pages ?? null })),
  applicant: {
    displayName: seed.displayName,
    email: seed.profile?.email ?? '',
    headline: seed.profile?.headline ?? '',
    careers: seed.profile?.careers ?? [],
    skills: seed.profile?.skills ?? [],
    hubProfileId: seed.profile?.hubProfileId ?? null,
    profileSource: seed.profileSource ?? 'CURRENT',
    capturedAt: seed.profileSource === 'SUBMITTED' ? seed.appliedAt : null,
  },
})

export const COUNT_KEY = {
  APPLIED: 'applied',
  SCREENING: 'screening',
  INTERVIEW: 'interview',
  OFFER: 'offer',
  ACCEPTED: 'offer',
  REJECTED: 'rejected',
  WITHDRAWN: 'rejected',
} as const

export const BOARD_COUNTS = { total: 38, applied: 24, screening: 8, interview: 4, offer: 1, rejected: 1 }

export const applicantCounts = (postingId: string) => {
  const records = applicantsByPosting.get(postingId) ?? []
  const counts = postingId === 'job-1' ? { ...BOARD_COUNTS } : { total: records.length, applied: 0, screening: 0, interview: 0, offer: 0, rejected: 0 }
  for (const { application, seed } of records) {
    const from = COUNT_KEY[seed.stage as keyof typeof COUNT_KEY]
    const to = COUNT_KEY[application.stage as keyof typeof COUNT_KEY]
    if (postingId !== 'job-1' && to) counts[to] += 1
    if (postingId === 'job-1' && from && to && from !== to) {
      counts[from] -= 1
      counts[to] += 1
    }
  }
  return counts
}

export const applicantsByPosting = new Map<string, ApplicantRecord[]>([['job-1', APPLICANT_SEEDS.map(applicantRecord)]])

export const syncListing = (item: CompanyPosting) => {
  const listing = listings.find((row) => row.id === item.id)
  if (listing) Object.assign(listing, toCard(item))
}

export const applyPostingPatch = (item: CompanyPosting, payload: Record<string, unknown>) => {
  if (typeof payload.title === 'string') item.title = payload.title
  if (typeof payload.description === 'string') item.description = payload.description
  if (Array.isArray(payload.requirements)) item.requirements = stringList(payload.requirements)
  if (Array.isArray(payload.preferred)) item.preferred = stringList(payload.preferred)
  if ('workConditions' in payload) item.workConditions = recordOf(payload.workConditions)
  if ('jobCategory' in payload) item.jobCategory = asJobCategory(payload.jobCategory)
  if ('careerMin' in payload) item.careerMin = careerMinOf(payload.careerMin)
  if ('careerMax' in payload) item.careerMax = typeof payload.careerMax === 'number' ? payload.careerMax : null
  if (typeof payload.location === 'string') item.location = payload.location
  if ('employmentType' in payload) item.employmentType = asEmploymentType(payload.employmentType)
  if ('deadline' in payload) item.deadline = deadlineOf(payload.deadline)
  if (Array.isArray(payload.skills)) item.skills = stringList(payload.skills)
  item.revision += 1
}

export const revisionConflict = (currentRevision: number) =>
  json(409, {
    error: { code: 'REVISION_CONFLICT', message: '공고가 이미 바뀌었어요', details: { currentRevision } },
  })

export const ownedPostingResponse = (id: string) => {
  const owned = companyPostings.find((item) => item.id === id)
  if (!owned) return null
  const flag = flags.get(id)
  return json(200, {
    data: {
      ...owned,
      bookmarked: flag?.bookmarked ?? owned.bookmarked,
      applied: flag?.applied ?? owned.applied,
    },
  })
}

export const splitParam = (url: URL, key: string) =>
  (url.searchParams.get(key) ?? '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

export const deadlineSoon = (deadline: string | null) => {
  if (!deadline) return false
  const when = Date.parse(`${deadline.slice(0, 10)}T00:00:00Z`)
  if (Number.isNaN(when)) return false
  const days = Math.round((when - DEADLINE_ORIGIN) / DAY_MS)
  return days >= 0 && days <= 7
}

export const CAREER_SPAN: Record<string, [number, number]> = {
  '0': [0, 0],
  '1-3': [1, 3],
  '4-6': [4, 6],
  '7-9': [7, 9],
  '10+': [10, 100],
}

export const careerSpan = (item: Posting): [number, number] =>
  item.careerMin === 0 && item.careerMax == null ? [0, 0] : [item.careerMin, item.careerMax ?? 100]

export const careerOverlaps = (item: Posting, key: string) => {
  const span = CAREER_SPAN[key]
  if (!span) return false
  const [low, high] = careerSpan(item)
  return low <= span[1] && high >= span[0]
}

export const filteredPostings = (url: URL, signed: boolean) => {
  const categories = splitParam(url, 'category')
  const skills = splitParam(url, 'skills')
  const years = splitParam(url, 'careerYears')
  const places = splitParam(url, 'location')
  const employment = splitParam(url, 'employmentType')
  const sort = url.searchParams.get('sort') ?? 'latest'
  let items = listings.filter((item) => {
    if (categories.length > 0 && !categories.includes(item.jobCategory)) return false
    if (skills.length > 0 && !skills.some((skill) => item.skills.includes(skill))) return false
    if (years.length > 0 && !years.some((year) => careerOverlaps(item, year))) return false
    if (places.length > 0 && !places.includes(item.location)) return false
    if (employment.length > 0 && !employment.includes(item.employmentType)) return false
    if ((sort === 'deadline' || url.searchParams.get('deadlineWithin') === '7') && !deadlineSoon(item.deadline)) return false
    return true
  })
  if (sort === 'popular') items = [...items].sort((a, b) => popularRank(a.id) - popularRank(b.id))
  else if (sort === 'deadline') items = [...items].sort((a, b) => (a.deadline ?? '').localeCompare(b.deadline ?? ''))
  else items = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return items.map((item) => present(item, signed))
}

export const pageOf = (url: URL, items: Posting[], defaultLimit = items.length, total = items.length) => {
  const rawLimit = Number(url.searchParams.get('limit') ?? defaultLimit)
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : items.length
  const cursor = url.searchParams.get('cursor')
  const found = cursor ? items.findIndex((item) => item.id === cursor) : -1
  const start = found >= 0 ? found + 1 : 0
  const data = items.slice(start, start + limit)
  const hasMore = start + limit < items.length
  return {
    data,
    page: { nextCursor: hasMore ? (data[data.length - 1]?.id ?? null) : null, hasMore, total },
  }
}

export const popularRank = (id: string) => {
  const at = POPULAR_ORDER.indexOf(id)
  return at < 0 ? POPULAR_ORDER.length : at
}

export const NARROWING_FILTERS = ['skills', 'careerYears', 'location', 'employmentType']

export const REPEAT_MARK = '~'

export const catalogPage = (url: URL, items: Posting[]) => {
  const narrowed = NARROWING_FILTERS.some((key) => splitParam(url, key).length > 0) || url.searchParams.get('deadlineWithin') === '7'
  const total = narrowed || items.length === 0 ? 0 : (CATALOG_TOTALS[splitParam(url, 'category').sort().join(',')] ?? 0)
  const catalog =
    total > items.length
      ? Array.from({ length: total }, (_, at) => {
          const item = items[at % items.length]!
          return at < items.length ? item : { ...item, id: `${item.id}${REPEAT_MARK}${Math.floor(at / items.length)}` }
        })
      : items
  return pageOf(url, catalog, HOME_RAIL_SIZE)
}

export let links: UserLink[] = SEED_LINKS.map((item) => ({ ...item }))

export const hubProfiles: Profile[] = HUB_PROFILES.map((item) => ({ ...item }))

export const socialFlags = new Map<string, { following: boolean; offered: boolean }>(MY_FOLLOWS.map((id) => [id, { following: true, offered: false }]))

export const withFlags = (item: Profile): Profile => {
  const flag = socialFlags.get(item.userId)
  return { ...item, following: flag?.following ?? false, offered: flag?.offered ?? false }
}

export const profileById = (id: string): Profile =>
  withFlags(hubProfiles.find((item) => item.userId === id) ?? { ...HUB_PROFILES[0]!, userId: id })

export let meProfile: Profile = { ...ME_PROFILE }

export let feed: Post[] = FEED.map((item) => ({ ...item }))

export const myPosts: Post[] = MY_POSTS.map((item) => ({ ...item }))

export const postById = (id: string) => feed.find((item) => item.id === id) ?? myPosts.find((item) => item.id === id)

export const commentThreads = new Map<string, Comment[]>(COMMENT_THREADS.map(([id, list]) => [id, list.map((item) => ({ ...item }))]))

export let receivedOffers: Offer[] = RECEIVED_OFFERS.map((item) => ({ ...item }))

export let sentOffers: Offer[] = SENT_OFFERS.map((item) => ({ ...item }))

export const offerThreads = new Map<string, OfferMessage[]>(OFFER_THREADS.map(([id, list]) => [id, list.map((item) => ({ ...item }))]))

export const offerById = (id: string) => receivedOffers.find((item) => item.id === id) ?? sentOffers.find((item) => item.id === id)

export let notices: WebNotification[] = SEED_NOTICES.map((item) => ({ ...item }))
export let employerNotices: WebNotification[] = EMPLOYER_NOTICES.map((item) => ({ ...item }))

export const noticeBox = () => (employerPersona() ? employerNotices : notices)
export const setNoticeBox = (next: WebNotification[]) => {
  if (employerPersona()) employerNotices = next
  else notices = next
}

export let settings: Settings = {
  notifyDeadline: true,
  notifyOffer: true,
  notifyComment: true,
  notifyAiDone: true,
  notifyApplicationStage: true,
  locale: 'ko',
  profilePublic: true,
  careerStatusVisibility: 'everyone',
  hideFromCurrentCompany: false,
  contactVisibility: 'accepted',
  defaultTone: 'as_is',
  chatRetentionDays: null,
  allowAiReadMyFiles: false,
  aiAccessMode: 'AUTO',
  defaultEffort: 'MEDIUM',
  confirmBeforeEdit: true,
}

export let consent: Consent = {
  referenceData: false,
  updatedAt: null,
  terms: {
    version: LEGAL_VERSION,
    age14At: '2026-10-01T00:00:00.000Z',
    serviceTermsAt: '2026-10-01T00:00:00.000Z',
    privacyAt: '2026-10-01T00:00:00.000Z',
    marketing: false,
    marketingAt: null,
  },
}
export const consentNow = (): Consent => (mockSwitch('signup-consent') ? { ...consent, terms: undefined } : consent)

export const applications: Application[] = APPLICATIONS.map((item) => ({ ...item }))

export const calendarEvents = CALENDAR_EVENTS.map((item) => ({ ...item }))

export const seedSources: SeedSource[] = SEED_SOURCES.map((item) => ({ ...item }))

export const uploadedSources: SeedSource[] = []

export const DELETED_SOURCE_ID = 'src-ai-toss'

export const allSources = () =>
  [...uploadedSources, ...seedSources].filter((item) => !(mockSwitch('docs-deleted') && item.id === DELETED_SOURCE_ID))

export const removeSource = (id: string) => {
  for (const list of [uploadedSources, seedSources]) {
    const at = list.findIndex((item) => item.id === id)
    if (at >= 0) return list.splice(at, 1).length > 0
  }
  return false
}

export const documentRevisions = new Map<string, number>()
export const archivedDocs = new Map<string, { source: SeedSource; list: SeedSource[] }>()

export const pushDocument = (source: SeedSource, status = 'DRAFT') => ({
  id: source.id,
  revision: documentRevisions.get(source.id) ?? 1,
  title: source.fileName,
  kind: 'TAILORED',
  status,
  updatedAt: source.createdAt,
  applicationId: null,
  latestVersionId: `${source.id}-v1`,
  finalizedVersionId: null,
})

export const libraryItem = (source: SeedSource) => ({
  ...(source.company ? { company: source.company, postingTitle: source.postingTitle } : {}),
  id: source.id,
  fileName: source.fileName,
  mimeType: source.mimeType,
  size: source.size,
  pageCount: null,
  createdAt: source.createdAt ?? null,
  origin: source.kind === 'AI_MADE' ? 'AI' : 'UPLOAD',
})

export const employerPersona = () => {
  const kind = mockPersona()
  return kind === 'employer' || kind === 'employer-pro' || kind === 'employer-ultra' || kind === 'employer-new'
}

export type CompanyInvite = { id: string; email: string; expiresAt: string; invitedAt: string; sentAt: number }

export type CompanyProfile = {
  legalName: string | null
  representativeName: string | null
  industry: string | null
  website: string | null
  intro: string | null
  logoKey: string | null
  logoUrl: string | null
}

export type CompanyRecord = {
  company: Company & CompanyProfile
  members: CompanyMember[]
  invites: CompanyInvite[]
}

export const INVITE_MS = 7 * 86_400_000

export const pendingInvite = (email: string): CompanyInvite => ({ id: `inv-${++inviteSeq}`, email, ...inviteWindow() })

export const inviteWindow = () => ({
  invitedAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + INVITE_MS).toISOString(),
  sentAt: Date.now(),
})

export const RESEND_COOLDOWN_SEC = 60

export const inviteView = ({ sentAt: _sentAt, ...item }: CompanyInvite) => item

export const MOAPAY_PROFILE: CompanyProfile = {
  legalName: '모아페이 주식회사',
  representativeName: '박정우',
  industry: '핀테크',
  website: 'moapay.kr',
  intro: '결제와 정산을 직접 만드는 핀테크 회사예요.',
  logoKey: null,
  logoUrl: null,
}

export const companyRecords = new Map<string, CompanyRecord>()

export let inviteSeq = 0

export const personaKey = () => mockPersona() ?? 'default'

export const APP_VIEWER_ID = 'dev'

export const currentUserId = () => sessionStore.load()?.user.id ?? 'u1'

export const adminMember = (joinedAt: string): CompanyMember => ({
  userId: currentUserId(),
  email: MEMBER_EMAIL,
  displayName: sessionStore.load()?.user.displayName ?? '이민아',
  role: 'ADMIN',
  joinedAt,
})

export const COMPANY_BRAND = '모아페이'
export const COMPANY_BNO = '2148703921'

export const memberSeats = (plan: Company['plan'], verifiedAt: string): CompanyRecord => ({
  company: { id: 'co-1', bNo: COMPANY_BNO, name: COMPANY_BRAND, ...MOAPAY_PROFILE, plan, verifiedAt, role: 'MEMBER', seats: { used: 2, limit: 2 } },
  members: [
    { userId: 'u-admin', email: MEMBER_EMAIL, displayName: '이민아', role: 'ADMIN', joinedAt: verifiedAt },
    { userId: MEMBER_USER.id, email: MEMBER_USER.email, displayName: MEMBER_USER.displayName, role: 'MEMBER', joinedAt: '2026-09-02T00:00:00.000Z' },
    { userId: 'u-sora', email: 'sora.park@moapay.kr', displayName: '박소라', role: 'MEMBER', joinedAt: '2026-11-01T00:00:00.000Z' },
  ],
  invites: [
    {
      id: 'inv-pending',
      email: 'nuri.choi@moapay.kr',
      invitedAt: '2026-11-03T00:00:00.000Z',
      expiresAt: new Date(Date.now() + 7 * 86_400_000).toISOString(),
      sentAt: Date.now(),
    },
  ],
})

export const seedCompany = (): CompanyRecord | null => {
  const kind = mockPersona()
  const verifiedAt = '2026-09-01T00:00:00.000Z'
  if (memberView()) {
    const plan = kind === 'employer-ultra' ? 'ULTRA' : kind === 'employer' ? 'BASIC' : 'PRO'
    return memberSeats(plan, verifiedAt)
  }
  if (kind === 'employer') {
    return {
      company: {
        id: 'co-1',
        bNo: COMPANY_BNO,
        name: COMPANY_BRAND,
        ...MOAPAY_PROFILE,
        plan: 'BASIC',
        verifiedAt,
        role: 'ADMIN',
        seats: { used: 0, limit: 0 },
      },
      members: [adminMember(verifiedAt)],
      invites: [],
    }
  }
  if (kind === 'employer-pro') {
    return {
      company: {
        id: 'co-1',
        bNo: COMPANY_BNO,
        name: COMPANY_BRAND,
        ...MOAPAY_PROFILE,
        plan: 'PRO',
        verifiedAt,
        role: 'ADMIN',
        seats: { used: 1, limit: 2 },
      },
      members: [
        adminMember(verifiedAt),
        { userId: 'u-member', email: 'jiho.han@moapay.kr', displayName: '한지호', role: 'MEMBER', joinedAt: '2026-09-02T00:00:00.000Z' },
      ],
      invites: [],
    }
  }
  if (kind === 'employer-ultra') {
    return {
      company: {
        id: 'co-1',
        bNo: COMPANY_BNO,
        name: COMPANY_BRAND,
        ...MOAPAY_PROFILE,
        plan: 'ULTRA',
        verifiedAt,
        role: 'ADMIN',
        seats: { used: 0, limit: 5 },
      },
      members: [adminMember(verifiedAt)],
      invites: [],
    }
  }
  return null
}

export const companyRecord = (): CompanyRecord | null => {
  const key = personaKey()
  const existing = companyRecords.get(key)
  if (existing) return existing
  const seeded = seedCompany()
  if (!seeded) return null
  companyRecords.set(key, seeded)
  return seeded
}

export const companyMe = (): Company | null => companyRecord()?.company ?? null

export const rememberCompany = (record: CompanyRecord) => {
  companyRecords.set(personaKey(), record)
}

export const routeTail = (pathname: string) => {
  const marker = '/api/v1'
  const at = pathname.indexOf(marker)
  const tail = (at >= 0 ? pathname.slice(at + marker.length) : pathname).replace(/\/+$/, '')
  return tail || '/'
}

export const slicePage = <T,>(url: URL, items: T[], idOf: (item: T) => string) => {
  const rawLimit = Number(url.searchParams.get('limit') ?? String(items.length || 1))
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : items.length || 1
  const cursor = url.searchParams.get('cursor')
  const found = cursor ? items.findIndex((item) => idOf(item) === cursor) : -1
  const start = found >= 0 ? found + 1 : 0
  const data = items.slice(start, start + limit)
  const hasMore = start + limit < items.length
  const last = data[data.length - 1]
  return { data, page: { nextCursor: hasMore && last ? idOf(last) : null, hasMore, total: items.length } }
}

export const asStrings = (value: unknown) => (Array.isArray(value) ? value.map(String) : null)

export const asCareers = (value: unknown): Profile['careers'] | null => {
  if (!Array.isArray(value)) return null
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return []
    const row = item as Record<string, unknown>
    return [
      {
        company: String(row.company ?? ''),
        role: String(row.role ?? ''),
        startedOn: String(row.startedOn ?? ''),
        endedOn: row.endedOn == null || row.endedOn === '' ? null : String(row.endedOn),
        description: String(row.description ?? ''),
      },
    ]
  })
}

export const googleIntegration = (connected: boolean): GoogleIntegration => ({
  enabled: true,
  connected,
  scopes: [],
  gmailStatus: 'DISCONNECTED',
  calendarStatus: connected ? 'CONNECTED' : 'DISCONNECTED',
  lastSyncedAt: null,
})

export type Block = { user: Offer['sender']; createdAt: string }

export let blocks: Block[] | null = null

export const blockList = () => (blocks ??= mockSwitch('blocks-list') ? BLOCK_SEEDS.map((item) => ({ ...item, user: { ...item.user } })) : [])

export const CANT_SEND_OFFER = 'offer-1'

export const cantSend = (offerId: string) => mockSwitch('inbox-cant-send') && offerId === CANT_SEND_OFFER

export const respondedAt = new Map<string, string>([['offer-4', '2026-10-15T01:00:00.000Z']])

export const offerView = (offer: Offer) => {
  const blocked = blockList().some((item) => item.user.id === offer.sender.id || item.user.id === offer.recipient.id)
  return {
    ...offer,
    respondedAt: offer.status === 'SENT' ? null : (respondedAt.get(offer.id) ?? offer.readAt),
    canSend: offer.status === 'ACCEPTED' && !blocked && !cantSend(offer.id),
  }
}

export const failedReply = (offerId: string) => ({
  ...CANT_SEND_REPLY,
  offerId,
  sender: { id: 'u1', displayName: meProfile.displayName, avatarUrl: null },
  status: 'FAILED',
})

export const adminOnly = () => failure(403, 'FORBIDDEN', '관리자만 할 수 있어요')

export const setSentOffers = (next: Offer[]) => {
  sentOffers = next
}
export const setFeed = (next: Post[]) => {
  feed = next
}
export const setLinks = (next: UserLink[]) => {
  links = next
}
export const setMeProfile = (next: Profile) => {
  meProfile = next
}
export const setSettings = (next: Settings) => {
  settings = next
}
export const setConsent = (next: Consent) => {
  consent = next
}
export const setBlocks = (next: Block[]) => {
  blocks = next
}
export const bumpCompanyPostingSeq = () => {
  companyPostingSeq += 1
}
