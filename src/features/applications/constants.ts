export const FILTER_ALL = '전체'

export const APPLICANT_NEW = '새'

export const APPLICANTS_HEAD = ['지원자', '제출 서류', '지원일', '단계'] as const

export const DOC_PROFILE = '프로필'

export const DOC_PDF = 'PDF'

export const DOC_FILE = '파일'

export const STAGE_APPLIED = '지원함'

export const STAGE_TITLE = '단계'

export const stagePickLabel = (name: string, label: string) => `${name} 단계 ${label}, 바꾸기`

export const submittedAsIs = (date: string) => `${date} 제출한 그대로예요`

export const PROFILE_NOW = '지금 프로필 기준'

export const DOCUMENT_EMPTY = '내용을 미리 볼 수 없는 파일이에요'

export const SHEET_INTRO = '소개'

export const SHEET_CAREERS = '경력'

export const SHEET_SKILLS = '기술'

export const SHEET_LIVE = '경력과 기술은 지금 프로필 기준이에요'

export const FILE_DOWNLOAD = '파일 받기'

export const memberInitials = (name: string) => {
  const chars = [...name.trim()]
  return /^[가-힣]{3,}$/.test(name.trim())
    ? chars.slice(-2).join('')
    : (chars[0] ?? '').toUpperCase()
}

export const APPLICATION_EMPTY = '아직 지원한 공고가 없어요.'

export const CALENDAR_EMPTY = '이날은 일정이 없어요.'

export const APPLY_FILTERS = [
  { key: 'all', label: '전체' },
  { key: 'active', label: '진행 중' },
  { key: 'done', label: '끝남' },
] as const

export const APPLY_HEAD = { posting: '공고', fit: '적합도', stage: '단계' } as const

export const EVENT_KINDS = [
  { key: 'INTERVIEW', label: '면접', tone: 'orange' },
  { key: 'DEADLINE', label: '마감', tone: 'red' },
  { key: 'FOLLOW_UP', label: '후속 연락', tone: 'grey' },
  { key: 'COFFEE_CHAT', label: '커피챗', tone: 'green' },
  { key: 'CUSTOM', label: '직접 추가', tone: 'ac' },
] as const

export const CALENDAR_COPY = {
  prev: '이전 달',
  next: '다음 달',
  add: '일정 추가',
  google: { on: 'Google 캘린더 연결됨', off: 'Google 연결 안 됨' },
  dialogTitle: '어떤 일정을 추가할까요?',
  titleLabel: '일정 이름',
  kindLabel: '일정 종류',
  dateLabel: '날짜',
  timeLabel: '시간',
  submit: '일정 추가하기',
  close: '닫기',
  added: '일정을 추가했어요',
  failed: '일정을 추가하지 못했어요. 잠시 후 다시 시도해 주세요.',
  defaultTime: '14:00',
} as const

export const CALENDAR_WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const

export const FIT_NOTE =
  '적합도는 앱에서 계산한 점수예요. 자세한 항목과 고칠 점은 앱의 에이전트에서 볼 수 있어요.'

export const ACTIVITY_LOAD_ERROR = '목록을 불러오지 못했어요.'
