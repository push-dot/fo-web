import { contactMissing } from '@push/api-client'
import { formatPhone } from '../../auth'
import type { Contact, ContactEmailSent, ContactMissing } from '@push/api-client'

export { contactRequired } from '@push/api-client'

export const CONTACT_TITLE = '연락받을 정보를 확인해 주세요'
export const CONTACT_LEAD = '기업이 지원 결과를 이 번호와 이메일로 알려 줘요.'
export const CONTACT_PHONE = '휴대폰 번호'
export const CONTACT_EMAIL = '이메일'
export const CONTACT_SEND = '인증번호 받기'
export const CONTACT_USE_EMAIL = '이 이메일 쓰기'
export const CONTACT_CODE = '인증번호 6자리'
export const CONTACT_CONFIRM = '확인'
export const CONTACT_DONE = '인증했어요'
export const CONTACT_CTA = '지원 계속하기'
export const CONTACT_TAKEN_TITLE = '이 번호로 가입한 다른 계정이 있어요'
export const CONTACT_TAKEN_BODY = '그 계정의 서류와 파일을 지금 계정으로 옮기고, 번호를 이 계정에 연결할까요?'
export const CONTACT_TAKEN_CLOSE = '닫기'
export const CONTACT_TAKEN_MOVE = '옮기고 연결하기'
export const CONTACT_CODE_WRONG = '인증번호가 맞지 않아요'
export const CONTACT_CODE_EXPIRED = '인증번호 시간이 지났어요. 다시 받아 주세요'
export const CONTACT_FAILED = '잠시 후 다시 시도해 주세요.'

export const emailCodeSent = (email: string) => `${email}로 인증번호를 보냈어요`

export const missingContact = (contact: Contact | undefined, required: ContactMissing[] | null): ContactMissing[] =>
  required ?? contactMissing(contact)

export const emailVerified = (sent: ContactEmailSent): sent is Extract<ContactEmailSent, { verified: true }> => 'verified' in sent

export const localPhone = (phone: string) => formatPhone(phone.replace(/^\+82/, '0'))

export const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())

type ErrorLike = { code?: string; details?: Record<string, unknown> | null }

export const phoneMovable = (caught: unknown) => {
  const { code, details } = (caught ?? {}) as ErrorLike
  return code === 'PHONE_TAKEN' && details?.canMoveDocuments === true
}

export const contactFailure = (caught: unknown) => {
  const { code, details } = (caught ?? {}) as ErrorLike
  if (code === 'PHONE_CODE_INVALID' || code === 'EMAIL_CODE_INVALID') return CONTACT_CODE_WRONG
  if (code === 'PHONE_CODE_EXPIRED' || code === 'EMAIL_CODE_EXPIRED') return CONTACT_CODE_EXPIRED
  const wait = Number(details?.retryAfterSec)
  if (code === 'RATE_LIMITED' && Number.isFinite(wait) && wait > 0) return `${Math.ceil(wait)}초 뒤에 다시 받을 수 있어요`
  return CONTACT_FAILED
}

export const movedToast = (moved: { documents: number; files: number }) =>
  moved.documents === 0 && moved.files === 0 ? '번호를 연결했어요' : `서류 ${moved.documents}개와 파일 ${moved.files}개를 옮겼어요`
