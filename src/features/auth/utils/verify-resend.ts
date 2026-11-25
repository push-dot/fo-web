import { ApiError } from '@push/api-client'
import {
  VERIFY_RESEND_COOLDOWN_MS,
  VERIFY_RESEND_FAILED,
  VERIFY_RESEND_LATER,
  VERIFY_RESEND_SENT,
} from '../constants'

export type VerifyResendResult = { toast: string | null; error: string | null; cooldownMs: number }

export const requestVerifyResend = async (
  email: string,
  send: (email: string) => Promise<void>,
): Promise<VerifyResendResult> => {
  try {
    await send(email)
    return { toast: VERIFY_RESEND_SENT, error: null, cooldownMs: VERIFY_RESEND_COOLDOWN_MS }
  } catch (caught) {
    if (caught instanceof ApiError && caught.status === 429) {
      return { toast: null, error: VERIFY_RESEND_LATER, cooldownMs: VERIFY_RESEND_COOLDOWN_MS }
    }
    return { toast: null, error: VERIFY_RESEND_FAILED, cooldownMs: 0 }
  }
}

export const resendCooling = (now: number, until: number) => now < until
