import { ApiError } from '@push/api-client'
import { describe, expect, it } from 'vitest'

import { verifyOutcome } from './verify-outcome'

const failure = (status: number, code: string, details?: Record<string, unknown>) =>
  new ApiError(code, code, status, details)

describe('verifyOutcome', () => {
  it('sends an expired link to the resend view with the signup email', () => {
    expect(verifyOutcome(failure(410, 'TOKEN_EXPIRED', { email: 'kim@push.app' }))).toEqual({
      view: 'expired',
      email: 'kim@push.app',
    })
  })

  it('treats a used, unknown or already-registered link as unusable', () => {
    expect(verifyOutcome(failure(401, 'UNAUTHENTICATED'))).toEqual({ view: 'invalid' })
    expect(verifyOutcome(failure(409, 'EMAIL_TAKEN', { accountType: 'EMPLOYER' }))).toEqual({ view: 'invalid' })
  })

  it('keeps the form, and the link, when the server refuses the password', () => {
    expect(verifyOutcome(failure(400, 'VALIDATION_ERROR', { field: 'password' }))).toEqual({
      view: 'form',
      field: 'password',
    })
  })

  it('keeps the form on any other failure', () => {
    expect(verifyOutcome(failure(500, 'INTERNAL'))).toEqual({ view: 'form', field: 'form' })
    expect(verifyOutcome(new Error('offline'))).toEqual({ view: 'form', field: 'form' })
  })
})
