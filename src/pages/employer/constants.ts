import type { EmployerStage } from '@push/api-client'
import { formatKrw } from '../../features/billing'
import { PLAN_NAME, seatLimit } from '../../features/billing'
import { endsWithVowel } from '../../features/billing'
import type { SeatPlan } from '../../features/company'

export const BNO_DIGITS = 10

export const START_DT_DIGITS = 8

export const VERIFY_TITLE = '사업자를 확인할게요'

export const VERIFY_LEAD =
  '국세청 정보와 맞으면 바로 끝나요. 확인을 마쳐야 공고를 올리고 에이전트를 쓸 수 있어요.'

export const LABEL_PNM = '대표자명'

export const LABEL_START = '개업일자'

export const LABEL_BNM = '상호'

export const VERIFY_NAME_HINT = '공고의 회사명으로 쓰여요'

export const VERIFY_STATUS_NOTE = '계속사업자만 확인돼요. 휴업·폐업 상태면 가입할 수 없어요.'

export const VERIFY_SUBMIT = '사업자 확인하기'

export const VERIFY_PENDING = '국세청에서 확인하는 중…'

export const VERIFY_MISMATCH = '국세청 정보와 맞지 않아요'

export const VERIFY_MISMATCH_DETAIL = '대표자명과 개업일자를 사업자등록증과 똑같이 적어 주세요.'

export const VERIFY_RETRY = '개업 직후라면 1–2일 뒤 다시 시도해 주세요.'

export const COMPANY_EXISTS_COPY = '이미 등록된 사업자번호예요. 초대 링크로 들어와 주세요.'

export const MEMBERS_TITLE = '담당자 관리'

export const MEMBERS_LOADING = '담당자를 불러오고 있어요.'

export const MEMBERS_FAILED = '담당자를 불러오지 못했어요.'

export const COMPANY_MISSING = '사업자 인증이 필요해요'

export const INVITE_SENT = '초대 메일을 보냈어요'

export const INVITE_ACCEPT_FAILED = '초대를 받지 못했어요. 링크를 다시 확인해 주세요.'

export const inviteTitle = (company: string) => `${company}에서 초대했어요`

export const inviterLabel = (name: string, role: string) => `${name} 님(${role})`

export const INVITE_LEAD_SUBJECT = '이 '

export const INVITE_LEAD_OBJECT = '을'

export const INVITE_LEAD_ROLE = '채용 담당자로 초대했어요.'

export const INVITE_ACCEPTING = '수락하는 중이에요…'

export const invitePreparing = (company: string) =>
  `${company} 공간을 준비하고 있어요. 창을 닫지 마세요.`

export const INVITE_EXPIRED_TITLE = '초대가 만료됐어요'

export const INVITE_EXPIRED_WHY = '초대는 7일 뒤 만료돼요.'

export const INVITE_EXPIRED_NEXT = '관리자에게 초대를 다시 보내 달라고 해 주세요.'

export const INVITE_FACT_COMPANY = '회사'

export const INVITE_FACT_INVITER = '초대한 사람'

export const INVITE_FACT_EXPIRES = '만료'

export const INVITE_HOME = 'Push 홈으로'

export const INVITE_INVALID_TITLE = '초대 링크를 열 수 없어요'

export const INVITE_INVALID_WHY = '링크가 잘못됐거나 이미 취소된 초대예요.'

export const INVITE_INVALID_NEXT = '초대 메일의 링크를 다시 눌러 보거나, 관리자에게 확인해 주세요.'

export const INVITE_HAS_ACCOUNT = '이미 계정이 있나요?'

export const INVITE_LOGIN = '로그인'

export const INVITE_OTHER_TITLE = '다른 계정으로 로그인돼 있어요'

export const INVITE_OTHER_NOW = '지금은 '

export const INVITE_OTHER_PERSONAL = '개인 계정'

export const INVITE_OTHER_ACCOUNT = '다른 계정'

export const INVITE_OTHER_AS = '으로 로그인돼 있어요. 초대받은 '

export const INVITE_OTHER_NEED = '으로 로그인해야 수락할 수 있어요.'

export const INVITE_RELOGIN = '로그아웃하고 다시 로그인'

export const INVITE_KEEP = '지금 계정 유지하기'

export const inviteWelcome = (company: string) => `${company}에 들어왔어요`

export const INVITE_WELCOME_ROLE = ' · 채용 담당자'

export const INVITE_WELCOME_LEAD = '이제 팀과 함께 채용을 시작해요.'

export const INVITE_WELCOME_CAN = '이제 쓸 수 있어요'

export const INVITE_TO_POSTINGS = '공고 관리로 가기'

export const INVITE_TO_AGENT = '에이전트와 대화하기'

export const INVITE_CAN = '들어가면 함께 쓸 수 있어요'

export const INVITE_PERKS = [
  '공고와 지원자 관리',
  '에이전트 대화 (회사가 함께 봐요)',
  '사업자 확인 없이 바로 시작',
] as const

export const INVITE_GOOGLE = 'Google로 수락하기'

export const INVITE_EMAIL_ACCEPT = '이메일로 가입하고 수락하기'

export const INVITE_LIMIT = '초대받은 이메일로만 들어올 수 있어요 · 7일 뒤 만료돼요'

export const seatCount = (used: number, limit: number, plan: string | null) =>
  `담당자 ${used} / ${limit}명${plan ? ` · ${plan}` : ''} (관리자 제외)`

export const POSTINGS_TITLE = '공고 관리'

export const NEW_POSTING = '새 공고'

export const AI_POSTING = 'AI로 만들기'

export const POSTINGS_EMPTY = '등록한 공고가 없어요'

export const POSTINGS_LOADING = '공고를 불러오고 있어요'

export const POSTINGS_FAILED = '공고를 불러오지 못했어요'

export const POSTING_CLOSE_TITLE = '공고를 마감할까요?'

export const POSTING_CLOSE_BODY = '마감하면 새 지원을 받을 수 없고, 다시 열 수 없어요.'

export const POSTING_CLOSED = '공고를 마감했어요'

export const POSTING_CLOSE_FAILED = '공고를 마감하지 못했어요'

export const APPLICANTS_TITLE = '지원자'

export const APPLICANTS_EMPTY = '아직 지원자가 없어요'

export const APPLICANTS_EMPTY_BODY = '지원이 들어오면 여기에 모이고, 알림으로 알려 드려요.'

export const VIEW_POSTING = '공고 보기'

export const stageEmpty = (label: string) => `${label} 단계인 지원자가 없어요`

export const DOCS_NONE = '제출한 서류가 없어요'

export const APPLICANTS_LOADING = '지원자를 불러오고 있어요'

export const APPLICANTS_FAILED = '지원자를 불러오지 못했어요'

export const APPLICANTS_NOTE = '단계를 바꾸면 지원자의 지원활동이 같이 바뀌고 알림이 가요.'

export const STAGE_RETRY = '다시 시도'

export const STAGE_RETRY_NOTE = '잠시 후 다시 시도해 주세요.'

export const stageMoved = (name: string, label: string) => `${name} 님을 ${label} 단계로 옮겼어요`

export const stageNotMoved = (name: string, label: string) =>
  `${name} 님을 ${label} 단계로 옮기지 못했어요`

export const stageNotice = (name: string) =>
  name
    ? `바꾸면 ${name} 님에게 “지원 상태 변경” 알림이 가요.`
    : '바꾸면 지원자에게 “지원 상태 변경” 알림이 가요.'

export const stageFailed = (stage: EmployerStage) =>
  `${{ SCREENING: '서류 통과로', INTERVIEW: '면접으로', OFFER: '합격으로', REJECTED: '불합격으로' }[stage]} 바꾸지 못했어요.`

export const FILE_FAILED = '파일을 받지 못했어요'

export const HUB_PROFILE = '허브 프로필 보기'

export const AI_REVIEW = '서류 검토하기'

export const AI_INTERVIEW = '면접 질문 만들기'

export const APPLICANT_LOADING = '지원 내용을 불러오고 있어요'

export const APPLICANT_FAILED = '지원 내용을 불러오지 못했어요'

export const STAGE_ENDED = '이미 끝난 지원이에요'

export const EDITOR_TITLE = '공고 편집'

export const EDITOR_LOADING = '공고를 불러오고 있어요'

export const PREVIEW_POSTING = '미리보기'

export const LABEL_TITLE = '공고 제목'

export const LABEL_JOB_CATEGORY = '직군'

export const LABEL_CAREER = '경력'

export const LABEL_EMPLOYMENT_TYPE = '고용형태'

export const LABEL_LOCATION = '근무지'

export const LABEL_DEADLINE = '마감일'

export const LABEL_DESCRIPTION = '하는 일'

export const LABEL_REQUIREMENTS = '자격 요건'

export const LABEL_PREFERRED = '우대 사항'

export const LABEL_SKILLS = '기술 스택'

export const LABEL_IMAGE = '대표 이미지'

export const LABEL_COMPANY = '회사명'

export const AI_POLISH = 'AI로 다듬기'

export const COMPANY_NAME_NOTE = '회사명은 사업자 확인에서 가져와요.'

export const SAVE_POSTING = '공고 올리기'

export const SAVE_DRAFT = '초안으로 저장'

export const DRAFT_CONFIRM_TITLE = '초안으로 저장할까요?'

export const DRAFT_CONFIRM_BODY = '저장하면 공고가 내려가고, 다시 올릴 때까지 지원을 받지 않아요.'

export const IMAGE_CHANGE = '이미지 바꾸기'

export const IMAGE_FAILED = '이미지를 올리지 못했어요'

export const CLOSE_POSTING = '마감하기'

export const CLOSED_STATE = '마감된 공고예요'

export const CHAT_TITLE = '에이전트'

export const CHAT_CREATING = '대화를 만들고 있어요'

export const REFERENCE_POSTING = '참고 공고'

export const CHAT_ASSISTANT = '에이전트'

export const PLANS_TITLE = '기업 요금제'

export const PLANS_LOADING = '요금제를 불러오고 있어요'

export const PLANS_PERSONAL = '기업 요금제는 기업 계정에서 구독해요'

export const PLAN_CURRENT = '지금 쓰는 중'

export const PLAN_SUBSCRIBE = '구독하기'

export const PLAN_LEAD = '요금제마다 쓸 수 있는 양이 달라요'

export const planMonthly = (price: number) => `월 ${formatKrw(price)}`

export const PLAN_NOTE =
  '요금제는 에이전트에만 적용돼요. 공고 등록과 지원자 관리는 요금제 없이도 쓸 수 있어요. 결제와 변경은 관리자만 해요.'

export const PLAN_SECURE = '토스페이먼츠로 안전하게 결제돼요'

export const PLAN_TERMS_TITLE = '결제 전에 확인해 주세요'

export const PLAN_TERMS = [
  '구독하면 매달 같은 날, 등록한 카드로 요금이 자동 결제돼요.',
  '언제든 이 화면의 ‘구독 해지’에서 해지할 수 있어요. 해지해도 이미 결제한 기간이 끝날 때까지는 쓸 수 있어요.',
  '결제한 날부터 7일 안에, 받은 크레딧을 쓰지 않았다면 전액 환불받을 수 있어요.',
] as const

export const PLAN_PAY_FAILED_TITLE = '결제를 마치지 못했어요'

const FAIL_TEXT_MAX = 200

export const planPayFailedBody = (code: string | null, message: string | null) => {
  const reason = message?.trim().slice(0, FAIL_TEXT_MAX) || '결제창에서 나왔어요'
  const tail = code?.trim().slice(0, FAIL_TEXT_MAX)
  return `${reason}${tail ? ` (${tail})` : ''} 요금은 나가지 않았어요.`
}

export const PLAN_MANAGE_TITLE = '구독 관리'

export const planRenews = (date: string) => `${date}에 자동으로 결제돼요`

export const planEndsOn = (date: string) => `해지했어요. ${date}까지 쓸 수 있어요`

export const PLAN_UNSUBSCRIBE = '구독 해지'

export const PLAN_UNSUBSCRIBE_DONE = '구독을 해지했어요'

export const PLAN_UNSUBSCRIBE_FAILED = '구독을 해지하지 못했어요. 잠시 후 다시 해 주세요.'

export const PLAN_VIEWER_TITLE = '요금제는 관리자만 바꿀 수 있어요'

export const planViewerBody = (admin?: string) =>
  admin
    ? `바꾸거나 크레딧을 사려면 관리자 ${admin} 님에게 말해 주세요.`
    : '바꾸거나 크레딧을 사려면 관리자에게 말해 주세요.'

export const PLAN_BLURB = {
  BASIC: '기본 사용량',
  PRO: 'Basic의 5배 사용량',
  ULTRA: 'Pro의 2배 사용량',
} as const

export const planUsedPercent = (spentMicroCredits: number, monthlyMicroCredits: number) =>
  monthlyMicroCredits > 0
    ? Math.min(100, Math.max(0, Math.round((spentMicroCredits / monthlyMicroCredits) * 100)))
    : 0

export const PLAN_FEATURES = {
  BASIC: [
    { label: 'AI 공고 생성', on: true },
    { label: 'AI 서류 검토', on: true },
    { label: 'AI 면접 준비', on: false },
    { label: '외부 PDF 검토', on: false },
    { label: '담당자 초대', on: false },
  ],
  PRO: [
    { label: 'AI 공고 생성', on: true },
    { label: 'AI 서류 검토', on: true },
    { label: 'AI 면접 준비', on: true },
    { label: '외부 PDF 검토', on: false },
    { label: '담당자 2명 초대', on: true },
  ],
  ULTRA: [
    { label: 'AI 공고 생성', on: true },
    { label: 'AI 서류 검토', on: true },
    { label: 'AI 면접 준비', on: true },
    { label: '외부 PDF 검토', on: true },
    { label: '담당자 5명 초대', on: true },
  ],
} as const

export const MEMBERS_PERM_TITLE = '권한'

export const MEMBERS_ADMIN_CAN = '결제, 요금제 변경, 담당자 초대·내보내기'

export const MEMBERS_MEMBER_CAN = '공고, 지원자, 에이전트 대화를 함께 써요'

export const SEAT_FULL_PLANS = '요금제 보기'

export const TRANSFER_CONFIRM = '넘기기'

export const INVITE_RESENT = '초대 메일을 다시 보냈어요'

export const INVITE_REVOKED = '초대를 취소했어요'

export const INVITE_REVOKE_BODY = '보낸 초대 링크로는 더 들어올 수 없어요. 자리는 바로 비어요.'

export const revokeTitle = (email: string) => `${email} 초대를 취소할까요?`

const DAY_MS = 86_400_000

export const inviteExpiry = (email: string, expiresAt: string, now = Date.now()) => {
  const days = Math.ceil((Date.parse(expiresAt) - now) / DAY_MS)
  return `${email} · ${days > 0 ? `${days}일 뒤 만료` : '만료됨'}`
}

export const seatFullBody = (plan: SeatPlan) =>
  `${PLAN_NAME[plan]}는 관리자 말고 담당자를 ${seatLimit(plan)}명까지 둘 수 있어요. 초대 대기 중인 사람도 1명으로 세요.${plan === 'PRO' ? ` Ultra는 ${seatLimit('ULTRA')}명까지예요.` : ''}`

export const adminOnlyNote = (admin?: string) =>
  admin
    ? `담당자 초대와 내보내기는 관리자 ${admin} 님만 할 수 있어요.`
    : '담당자 초대와 내보내기는 관리자만 할 수 있어요.'

export const removeTitle = (name: string) => `${name} 님을 내보낼까요?`

export const removeBody = (company: string, name: string) =>
  `내보내면 ${company}의 공고, 지원자, 에이전트 대화를 더 볼 수 없어요. ${name} 님이 만든 공고와 대화는 회사에 남아요.`

export const transferTitle = (name: string) => `${name} 님에게 관리자를 넘길까요?`

export const transferBody = (name: string, self: string) =>
  `넘기면 결제, 요금제 변경, 담당자 초대·내보내기는 ${name} 님만 할 수 있어요. ${self} 님은 담당자가 돼요.`

export const planSwitchLabel = (
  name: string,
  current: boolean,
  higher: boolean,
  hasPlan: boolean,
) => {
  if (current) return PLAN_CURRENT
  if (!hasPlan) return PLAN_SUBSCRIBE
  return `${name}${endsWithVowel(name) ? '로' : '으로'} ${higher ? '올리기' : '바꾸기'}`
}
