import {
  authMe as fetchAuthMe,
  meConsents as fetchConsents,
  meSettings as fetchSettings,
  authRequestPasswordReset as authRequestPasswordResetOp,
  authConfirmPasswordReset as authConfirmPasswordResetOp,
  authPasswordResetEmail as authPasswordResetEmailOp,
  authStart as authStartOp,
  authEmailLogin as authEmailLoginOp,
  authExchange as authExchangeOp,
  authPhoneSend as authPhoneSendOp,
  authPhoneVerify as authPhoneVerifyOp,
  authLogout,
  authEmailSignup as authEmailSignupOp,
  meUpdateTerms as meUpdateTermsOp,
  authEmailResendVerify as authEmailResendVerifyOp,
  authEmailVerify as authEmailVerifyOp,
} from '../../../shared/api/operations'
import type { QueryClient } from '@tanstack/react-query'
import { cookieSession } from '../../../shared/auth/cookie-session'
import { sessionStore } from '../../../shared/auth/session'

export const authMe = (...args: Parameters<typeof fetchAuthMe>) => fetchAuthMe(...args)

export const meSettings = (...args: Parameters<typeof fetchSettings>) => fetchSettings(...args)

export const meConsents = (...args: Parameters<typeof fetchConsents>) => fetchConsents(...args)

export const authRequestPasswordReset = (...args: Parameters<typeof authRequestPasswordResetOp>) =>
  authRequestPasswordResetOp(...args)

export const authConfirmPasswordReset = (...args: Parameters<typeof authConfirmPasswordResetOp>) =>
  authConfirmPasswordResetOp(...args)

export const authPasswordResetEmail = (...args: Parameters<typeof authPasswordResetEmailOp>) =>
  authPasswordResetEmailOp(...args)

export const authStart = (...args: Parameters<typeof authStartOp>) => authStartOp(...args)

export const authEmailLogin = (...args: Parameters<typeof authEmailLoginOp>) =>
  authEmailLoginOp(...args)

export const authExchange = (...args: Parameters<typeof authExchangeOp>) => authExchangeOp(...args)

export const authPhoneSend = (...args: Parameters<typeof authPhoneSendOp>) =>
  authPhoneSendOp(...args)

export const authPhoneVerify = (...args: Parameters<typeof authPhoneVerifyOp>) =>
  authPhoneVerifyOp(...args)

export const signOut = async (queryClient: Pick<QueryClient, 'clear'>, { revoke = true } = {}) => {
  const refreshToken = sessionStore.load()?.refreshToken
  if (revoke && (cookieSession || refreshToken))
    await authLogout(cookieSession ? undefined : refreshToken).catch(() => undefined)
  sessionStore.clear()
  queryClient.clear()
}

export const authEmailSignup = (...args: Parameters<typeof authEmailSignupOp>) =>
  authEmailSignupOp(...args)

export const meUpdateTerms = (...args: Parameters<typeof meUpdateTermsOp>) =>
  meUpdateTermsOp(...args)

export const authEmailVerify = (...args: Parameters<typeof authEmailVerifyOp>) =>
  authEmailVerifyOp(...args)

export const authEmailResendVerify = (...args: Parameters<typeof authEmailResendVerifyOp>) =>
  authEmailResendVerifyOp(...args)
