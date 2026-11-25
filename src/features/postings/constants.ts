import type { CareerYears, EmploymentType, JobCategory } from '@push/api-client'

export const EDITOR_FAILED = '공고를 저장하지 못했어요'

export const LINK_COPIED_TOAST = '링크를 복사했어요'

export const STATUS_OPEN = '게시 중'

export const STATUS_DRAFT = '초안'

export const STATUS_CLOSED = '마감'

export const DEADLINE_OPEN = '상시'

export const DEADLINE_NONE = '–'

export const POSTINGS_HEAD = ['공고', '상태', '지원자', '마감'] as const

export const POSTING_MORE = '더 보기'

export const POSTING_EDIT = '공고 수정'

export const POSTING_APPLICANTS = '지원자 보기'

export const POSTING_CLOSE = '마감하기'

export const AGENT_DRAFT = '에이전트가 쓴 초안'

export const APPLICANT_UNIT = '명'

export const newApplicants = (count: number) => `새 ${count}`

export const josaGa = (name: string) => {
  const last = name.trim().charCodeAt(name.trim().length - 1)
  return last >= 0xac00 && last <= 0xd7a3 && (last - 0xac00) % 28 !== 0 ? '이' : '가'
}

export const postedBy = (name: string) => `${name}${josaGa(name)} 올림`

export const draftBy = (name: string) => `${name}${josaGa(name)} 쓴 초안`

export const APPLICANTS_LINK = '지원자'

export const SKILL_ADD = '추가'

export const SKILL_ADD_PLACEHOLDER = '기술 이름'

export const SKILL_REMOVE = '삭제'

export const CAREER_RANGES = [
  { label: '신입', min: 0, max: null },
  { label: '1–3년', min: 1, max: 3 },
  { label: '4–6년', min: 4, max: 6 },
  { label: '7–9년', min: 7, max: 9 },
  { label: '10년+', min: 10, max: null },
] as const

export const SKILL_OPTIONS = ['Kotlin', 'Java', 'Spring Boot', 'Go', 'React', 'Python'] as const

export const SKILL_SEARCH = '기술 스택 검색'

export const FILTER_CHIPS = [
  { key: 'category', label: '직무' },
  { key: 'skills', label: '기술 스택' },
  { key: 'career', label: '경력' },
  { key: 'location', label: '지역' },
  { key: 'employment', label: '고용형태' },
] as const

export type FilterKey = (typeof FILTER_CHIPS)[number]['key']

export type JobFilters = {
  category: JobCategory[]
  skills: string[]
  careerYears: CareerYears[]
  location: string[]
  employmentType: EmploymentType[]
}

export const FILTER_FIELD: Record<FilterKey, keyof JobFilters> = {
  category: 'category',
  skills: 'skills',
  career: 'careerYears',
  location: 'location',
  employment: 'employmentType',
}

export const BOOKMARK_EMPTY = '북마크한 공고가 없어요.'

export const BOOKMARK_EMPTY_SUB = '공고에서 북마크를 누르면 여기에 모여요.'

export const bookmarkCount = (count: number) => `북마크한 공고 ${count}개`

export const MOCK_FIT_DELAY_MS = 1200

export const APPLIED_TOAST = '지원했어요. 내 활동에서 진행 상황을 볼 수 있어요'

export const APPLY_LABEL = '지원하기'

export const APPLIED_LABEL = '지원 완료'

export const APPLIED_HINT = '내 활동에서 진행 상황을 볼 수 있어요'

export const BOOKMARK_LABEL = '북마크'

export const BOOKMARKED_TOAST = '공고를 북마크했어요'

export const SHARE_LABEL = '공유'

export const EMPLOYER_POSTING_CTA = '이 공고 참고해서 만들기'

export const EMPLOYER_POSTING_NOTE = '에이전트 채팅이 열리고 이 공고가 첨부돼요'

export const EMPLOYER_VERIFY_PATH = '/employer/verify'

export const SOURCE_AI = '에이전트로 맞춘 서류'

export const APPLY_TITLE = '어떤 서류로 지원할까요?'

export const APPLY_ASIDE = 'Push로 지원하면 고른 서류가 회사에 그대로 전달돼요.'

export const GUEST_APPLY_TITLE = '로그인하고 지원해요'

export const GUEST_APPLY_BODY = '로그인하면 이 공고로 돌아와서 바로 지원할 수 있어요.'

export const SIGN_UP = '회원가입'

export const applicantsLabel = (count: number) => `지원자 ${count}명`

export const guestApplyAction = (
  mode: 'webview' | 'guest' | 'personal' | 'employer',
  applied: boolean,
) => {
  if (mode === 'personal' && applied) return 'done'
  if (mode === 'personal') return 'sheet'
  if (mode === 'guest') return 'dialog'
  return 'ignore'
}
