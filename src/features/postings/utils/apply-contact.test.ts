import { describe, expect, it } from 'vitest'
import { CONTACT_CODE_EXPIRED, CONTACT_CODE_WRONG, CONTACT_FAILED, contactFailure, emailVerified, localPhone, missingContact, movedToast, phoneMovable, validEmail } from './apply-contact'

describe('apply contact', () => {
  it('prefers the parts a 403 named over the loaded contact', () => {
    expect(missingContact({ phone: null, email: null, loginEmail: 'a@b.co' }, null)).toEqual(['PHONE', 'EMAIL'])
    expect(missingContact({ phone: '+821012345678', email: 'a@b.co', loginEmail: null }, ['EMAIL'])).toEqual(['EMAIL'])
    expect(missingContact(undefined, null)).toEqual([])
  })

  it('maps code errors to the contact copy', () => {
    expect(contactFailure({ code: 'PHONE_CODE_INVALID' })).toBe(CONTACT_CODE_WRONG)
    expect(contactFailure({ code: 'EMAIL_CODE_INVALID', details: { attemptsLeft: 2 } })).toBe(CONTACT_CODE_WRONG)
    expect(contactFailure({ code: 'EMAIL_CODE_EXPIRED' })).toBe(CONTACT_CODE_EXPIRED)
    expect(contactFailure({ code: 'RATE_LIMITED', details: { retryAfterSec: 42 } })).toBe('42초 뒤에 다시 받을 수 있어요')
    expect(contactFailure({ code: 'RATE_LIMITED' })).toBe(CONTACT_FAILED)
    expect(contactFailure(new Error('x'))).toBe(CONTACT_FAILED)
  })

  it('offers the move only when the server allows it', () => {
    expect(phoneMovable({ code: 'PHONE_TAKEN', details: { canMoveDocuments: true } })).toBe(true)
    expect(phoneMovable({ code: 'PHONE_TAKEN' })).toBe(false)
    expect(phoneMovable(null)).toBe(false)
  })

  it('says what moved, or only that the number is linked', () => {
    expect(movedToast({ documents: 2, files: 1 })).toBe('서류 2개와 파일 1개를 옮겼어요')
    expect(movedToast({ documents: 0, files: 0 })).toBe('번호를 연결했어요')
  })

  it('reads the email send result and formats a saved phone', () => {
    expect(emailVerified({ email: 'a@b.co', verified: true })).toBe(true)
    expect(emailVerified({ cooldownSeconds: 60, expiresAt: '' })).toBe(false)
    expect(localPhone('+821012345678')).toBe('010-1234-5678')
    expect(validEmail(' a@b.co ')).toBe(true)
    expect(validEmail('a@b')).toBe(false)
  })
})
