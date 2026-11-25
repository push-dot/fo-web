import type { Settings } from '@push/api-client'
import { LEGAL_OPERATOR } from '@push/shared'
import type { ThemeChoice } from '../../shared/lib/theme'

export const CONSENT_COPY =
  '내 서류와 평가 결과를 가공해 다른 사용자와 기업의 AI가 참고 자료로 써요'

export const SETTINGS_CHANNEL_NOTE = '웹에서는 알림함에 쌓여요. 푸시 알림은 앱에서 받아요.'

export const LOCALE_NOTE = '화면과 에이전트 답변 언어가 함께 바뀌어요'

export const HIDE_COMPANY_LABEL = '현재 회사 사람에게 숨기기'

export const SETTINGS_LOAD_ERROR = '설정을 불러오지 못했어요.'

export const LOGIN_LABEL: Record<string, string> = {
  google: 'Google 계정으로 로그인',
  apple: 'Apple 계정으로 로그인',
  github: 'GitHub 계정으로 로그인',
  phone: '전화번호로 로그인',
  email: '이메일로 로그인',
}

export const CAREER_VISIBILITY: { key: Settings['careerStatusVisibility']; label: string }[] = [
  { key: 'everyone', label: '모두에게' },
  { key: 'followers', label: '팔로워에게만' },
  { key: 'private', label: '나만 보기' },
]

export const CONTACT_VISIBILITY: { key: Settings['contactVisibility']; label: string }[] = [
  { key: 'everyone', label: '모두에게' },
  { key: 'followers', label: '팔로워에게만' },
  { key: 'accepted', label: '제안 수락한 사람만' },
  { key: 'private', label: '나만 보기' },
]

export const LOCALES: { key: Settings['locale']; label: string }[] = [
  { key: 'ko', label: '한국어' },
  { key: 'en', label: 'English' },
]

export const THEME_LABEL: Record<ThemeChoice, string> = {
  light: '라이트',
  dark: '다크',
  system: '시스템',
}

export const SETTINGS_GROUPS = { notify: '알림', general: '일반', hub: '허브 공개' } as const

export const SETTINGS_LABELS = {
  title: '설정',
  locale: '언어',
  theme: '테마',
  profilePublic: '프로필 공개',
  career: '커리어 상태 공개 범위',
  contact: '연락처 공개 범위',
  support: '고객센터',
  terms: '약관 및 정책',
  logout: '로그아웃',
  withdraw: '회원 탈퇴',
} as const

export const SUPPORT_MAIL = `mailto:${LEGAL_OPERATOR.contactEmail}`

export const LOGOUT_TITLE = '로그아웃할까요?'
