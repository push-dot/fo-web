import type { JobFilters } from '../../features/postings'

export const JOB_SORTS = ['latest', 'deadline', 'popular'] as const

export type JobSort = (typeof JOB_SORTS)[number]

export const sortFrom = (value: string | null): JobSort =>
  JOB_SORTS.includes(value as JobSort) ? (value as JobSort) : 'latest'

export const SORT_LABEL: Record<JobSort, string> = {
  latest: '최신순',
  deadline: '마감 임박순',
  popular: '인기순',
}

export const JOB_PAGE_SIZE = 12

export const FILTERED_EMPTY = '조건에 맞는 공고가 없어요.'

export const FILTERED_EMPTY_HINT = '필터를 줄여 보세요.'

export const LOADING_MORE = '공고를 더 불러오는 중'

export const FILTER_RESET = '필터 초기화'

export const EMPTY_FILTERS: JobFilters = {
  category: [],
  skills: [],
  careerYears: [],
  location: [],
  employmentType: [],
}

export const JOBS_ERROR = '공고를 불러오지 못했어요'
