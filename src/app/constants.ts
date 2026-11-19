import { LEGAL_OPERATOR } from '@push/shared'

export const BRAND = 'Push.'
export const AUTH_BIZ = '기업'
export const AUTH_LOGOUT = '로그아웃'

export const NAV = {
  home: '홈',
  jobs: '채용공고',
  hub: '허브',
  social: '소셜',
  my: '마이',
  postings: '공고 관리',
  chat: '에이전트',
  login: '로그인',
  search: '검색',
  notifications: '알림',
  offers: '제안함',
  signup: '회원가입',
} as const

export const SEARCH_PLACEHOLDER = '공고, 사람, 글 검색'

export const ACCOUNT_MENU = {
  label: '계정 메뉴',
  settings: '설정',
  logout: '로그아웃',
  company: '회사 정보',
  members: '담당자 관리',
  plans: '기업 요금제',
} as const
export const FOOTER_LINKS = [
  { label: '이용약관', to: '/terms' },
  { label: '개인정보 처리방침', to: '/privacy' },
  { label: '고객센터' },
  { label: '기업 서비스' },
] as const
export const FOOTER_MARK = '© 2026 Push'
// Payment providers review the site for the operator's business details in the footer.
export const FOOTER_BUSINESS: readonly string[] =
  LEGAL_OPERATOR.kind === 'business'
    ? [
        `상호 ${LEGAL_OPERATOR.tradeName}`,
        `대표자 ${LEGAL_OPERATOR.representative}`,
        `사업자등록번호 ${LEGAL_OPERATOR.businessNumber}`,
        `통신판매업 신고번호 ${LEGAL_OPERATOR.mailOrderNumber}`,
        `주소 ${LEGAL_OPERATOR.address}`,
        `대표전화 ${LEGAL_OPERATOR.phone}`,
        `이메일 ${LEGAL_OPERATOR.contactEmail}`,
      ]
    : []
