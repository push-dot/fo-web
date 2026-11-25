export const PROVIDER_NAME = {
  google: 'Google',
  apple: 'Apple',
  github: 'GitHub',
} as const

export const PROVIDER_START_LABEL = {
  google: 'Google로 시작하기',
  apple: 'Apple로 시작하기',
  github: 'GitHub로 시작하기',
  phone: '휴대폰 번호로 시작하기',
} as const

export const providerLogin = (name: string) => `${name}로 로그인`

export const PHONE_TITLE = '휴대폰 번호를 입력해 주세요'

export const PHONE_LEAD =
  '지원 결과와 면접 일정을 알려 드릴 번호예요. 다른 사람에게는 보이지 않아요.'

export const PHONE_LABEL = '휴대폰 번호'

export const PHONE_SEND = '인증번호 받기'

export const PHONE_TAKEN_TITLE = '이미 가입된 번호예요'

export const PHONE_TAKEN_HEAD = '이 번호는 '

export const PHONE_TAKEN_TAIL = ' 계정과 연결돼 있어요.'

export const PHONE_TAKEN_OTHER = '이 번호는 다른 계정과 연결돼 있어요.'

export const PHONE_OTHER = '다른 번호 입력하기'

export const CODE_TITLE = '인증번호를 입력해 주세요'

export const CODE_LEAD_TAIL = '로 6자리 번호를 보냈어요.'

export const CODE_PLACEHOLDER = '인증번호 6자리'

export const CODE_SUBMIT = '확인'

export const CODE_COOLDOWN_TAIL = ' 후에 다시 받을 수 있어요'

export const CODE_CHANGE = '번호 바꾸기'

export const CODE_RESEND = '인증번호 다시 받기'

export const CODE_WRONG = '인증번호가 맞지 않아요. 다시 확인해 주세요.'

export const CODE_EXPIRED = '인증번호가 만료됐어요. 새 번호를 받아 주세요.'

export const CODE_SEND_LATER = '잠시 후에 다시 받을 수 있어요.'

export const CODE_LIMIT_DETAIL = '새 인증번호를 받아 다시 입력해 주세요.'

export const codeLimitTitle = (attempts: number) => `인증번호를 ${attempts}번 잘못 입력했어요`

export const CONSENT_TITLE = '서비스 이용에 동의해 주세요'

export const CONSENT_LEAD = '필수 항목에 동의하면 시작할 수 있어요.'

export const CONSENT_ALL = '전체 동의'

export const REQUIRED_TAG = '[필수]'

export const OPTIONAL_TAG = '[선택]'

export const TERMS_AGE = '만 14세 이상이에요'

export const TERMS_SERVICE = '서비스 이용약관'

export const TERMS_PRIVACY = '개인정보 수집·이용'

export const TERMS_MARKETING = '혜택·이벤트 알림 받기'

export const TERMS_VIEW = '보기'

export const TERMS_PRIVACY_POLICY = '개인정보 처리방침 보기'

export const CONSENT_SUBMIT = '동의하고 시작하기'

export const TERM_VIEW = {
  serviceTerms: '/terms',
  privacy: '/privacy-consent',
  marketing: '/marketing-consent',
} as const

export const VERIFY_MAIL_TITLE = '메일을 확인해 주세요'

export const VERIFY_MAIL_TAIL = '으로 인증 메일을 보냈어요.'

export const VERIFY_MAIL_DONE = '메일의 링크를 누르면 비밀번호를 정할 수 있어요.'

export const VERIFY_MAIL_MISSING = '메일이 오지 않았나요?'

export const VERIFY_MAIL_SPAM = '스팸함을 확인해 주세요. 링크는 24시간 동안 쓸 수 있어요.'

export const VERIFY_MAIL_RESEND = '인증 메일 다시 보내기'

export const verifyResendWait = (seconds: number) => `${VERIFY_MAIL_RESEND} (${seconds}초)`

export const VERIFY_RESEND_SENT = '인증 메일을 다시 보냈어요'

export const VERIFY_RESEND_LATER = '잠시 뒤에 다시 보내 주세요'

export const VERIFY_RESEND_FAILED = '인증 메일을 다시 보내지 못했어요'

export const VERIFY_RESEND_COOLDOWN_MS = 60_000

export const VERIFY_MAIL_OTHER = '다른 이메일로 가입하기'

export const SHOW_PASSWORD = '비밀번호 보기'

export const HIDE_PASSWORD = '비밀번호 숨기기'

export const LOGIN_FAILED_COPY = '로그인에 실패했어요'

export const TERMS_READ_FAILED =
  '번호는 확인했지만 로그인을 마치지 못했어요. 새 인증번호를 받아 다시 시도해 주세요.'

export const VERIFY_EXPIRED_TITLE = '인증 링크가 만료됐어요'

export const VERIFY_EXPIRED_WHY = '인증 메일의 링크는 24시간 동안 쓸 수 있어요.'

export const VERIFY_EXPIRED_NEXT = '메일을 다시 받아 기업 계정을 만들어 주세요.'

export const VERIFY_EXPIRED_TO = '받는 이메일'

export const PASSWORD_CHANGED_ACTION = '로그인하기'

export const VERIFY_INVALID_TITLE = '링크를 열 수 없어요'

export const VERIFY_INVALID_WHY = '링크가 잘못됐거나 이미 쓴 링크예요.'

export const VERIFY_INVALID_NEXT = '계정을 이미 만들었다면 로그인해 주세요.'

export const VERIFY_INVALID_RESTART = '처음부터 가입하기'

export const CALLBACK_PATH = '/auth/callback'
