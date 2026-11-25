import { PLAN_NAME, seatLimit, type EmployerPlanId } from '../billing'
import { ApiError } from '@push/api-client'
import { retryAfterSec } from '../../shared/api/retry-after'

export const VERIFY_LINK = '사업자 인증'

export const PLANS_LINK = '요금제 보기'

export const INVITE_ADMIN_ONLY = '담당자 초대는 관리자만 할 수 있어요'

export const INVITE_BASIC = 'Basic에서는 담당자를 초대할 수 없어요'

export const inviteLimitCopy = (used: number, limit: number) =>
  `담당자 ${used}/${limit}명까지 초대할 수 있어요`

export const LABEL_BNO = '사업자등록번호'

export const LABEL_STATUS = '상태'

export const LABEL_ROLE = '내 권한'

export const VERIFY_STATUS = '계속사업자'

export const VERIFY_DONE_LEAD = '이제 공고를 올리고 에이전트를 쓸 수 있어요.'

export const VERIFY_DONE_ADMIN = '처음 확인한 분이 관리자가 돼요.'

export const VERIFY_FIRST_POSTING = '첫 공고 올리기'

export const VERIFY_AI_POSTING = '에이전트로 공고 만들기'

export const STEP_ACCOUNT = '계정 만들기'

export const STEP_VERIFY = '사업자 확인'

export const STEP_START = '시작하기'

export const ROLE_ADMIN = '관리자'

export const ROLE_MEMBER = '담당자'

export const INVITE_EMAIL = '이메일'

export const INVITE_SUBMIT = '초대 메일 보내기'

export const INVITE_FAILED_SEND = '초대 메일을 보내지 못했어요.'

export const REMOVE_MEMBER = '내보내기'

export const TRANSFER_ADMIN = '관리자 넘기기'

export const MEMBER_SELF = '나'

export const MEMBERS_CLOSE = '닫기'

export const INVITE_DIALOG_TITLE = '담당자 초대'

export const INVITE_CANCEL = '취소'

export const MEMBER_MORE = '더 보기'

export const INVITE_PENDING_TITLE = '초대 보냄'

export const INVITE_PENDING = '대기 중'

export const INVITE_RESEND = '초대 다시 보내기'

export const INVITE_REVOKE = '초대 취소'

export const inviteLead = (company: string) =>
  `초대받은 사람은 사업자 확인 없이 ${company}로 들어와요.`

export type SeatPlan = 'PRO' | 'ULTRA'

export const seatPlan = (plan: EmployerPlanId): SeatPlan | null =>
  plan === 'PRO' || plan === 'ULTRA' ? plan : null

export const inviteFullNote = (plan: SeatPlan) =>
  `${PLAN_NAME[plan]}는 담당자 ${seatLimit(plan)}명까지 초대할 수 있어요. 더 초대하려면 ${plan === 'PRO' ? 'Ultra로 올리거나 ' : ''}기존 담당자를 내보내 주세요.`

export const COMPANY_UNVERIFIED = '사업자 인증이 필요해요'

export const COMPANY_LOCKED =
  '사업자 정보는 바꿀 수 없어요. 상호가 바뀌었다면 고객센터로 알려 주세요.'

export const COMPANY_NO_HUB = '기업 계정에는 허브 프로필이 없어요.'

export const COMPANY_VERIFIED = '확인됨'

export const COMPANY_REPRESENTATIVE = '대표자명'

export const COMPANY_INDUSTRY = '업종 태그'

export const COMPANY_WEBSITE = '홈페이지'

export const COMPANY_INTRO = '소개'

export const COMPANY_LOGO = '로고 바꾸기'

export const COMPANY_LOGO_FAILED = '로고를 바꾸지 못했어요. 잠시 후 다시 시도해 주세요.'

export const MEMBERS_ACTION_FAILED = '처리하지 못했어요. 잠시 후 다시 시도해 주세요.'

export const SEAT_FULL_TITLE = '담당자 자리가 꽉 찼어요'

export const MEMBERS_ADMIN_ONLY = '관리자만 할 수 있어요. 권한이 바뀌었는지 확인해 주세요.'

export const INVITE_GONE = '이미 수락했거나 취소된 초대예요'

export const MEMBER_GONE = '이미 회사를 나간 담당자예요'

export const resendWait = (sec: number) => `${sec}초 뒤에 다시 보낼 수 있어요`

export const memberActionError = (error: unknown, member = false) => {
  if (!(error instanceof ApiError)) return MEMBERS_ACTION_FAILED
  if (error.status === 429) {
    const sec = retryAfterSec(error)
    return sec ? resendWait(sec) : MEMBERS_ACTION_FAILED
  }
  if (error.code === 'SEAT_LIMIT') return SEAT_FULL_TITLE
  if (error.status === 403) return MEMBERS_ADMIN_ONLY
  if (error.status === 404 && error.code === 'NOT_FOUND') return member ? MEMBER_GONE : INVITE_GONE
  return MEMBERS_ACTION_FAILED
}
