import type { AccountType } from '@push/api-client'
import { useState, useEffect } from 'react'
import { createPkce, savePkceVerifier } from '../../shared/auth/pkce'
import type { OAuthProvider } from './utils/login-providers'
import { savePendingLogin } from './utils/pending-login'
import { authStart, signOut, authEmailResendVerify } from './api/fetchers'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../shared/ui/toast'
import { requestVerifyResend, resendCooling } from './utils/verify-resend'
import { CALLBACK_PATH } from './constants'

export const useOAuthStart = () => {
  const [pending, setPending] = useState(false)
  const [failed, setFailed] = useState<OAuthProvider | null>(null)

  const start = async (provider: OAuthProvider, accountType: AccountType) => {
    setFailed(null)
    setPending(true)
    try {
      const { verifier, challenge } = await createPkce()
      savePkceVerifier(verifier)
      savePendingLogin({ provider, accountType })
      const started = await authStart(provider, {
        codeChallenge: challenge,
        redirectUri: `${window.location.origin}${CALLBACK_PATH}`,
        accountType,
      })
      window.location.assign(started.authorizationUrl)
    } catch {
      setFailed(provider)
      setPending(false)
    }
  }

  return { start, pending, failed, clearFailed: () => setFailed(null) }
}

export const useSignOut = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  return async (options?: { revoke?: boolean }) => {
    await signOut(queryClient, options)
    navigate('/')
  }
}

export const useVerifyResend = (email: string) => {
  const toast = useToast()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [until, setUntil] = useState(0)
  const [now, setNow] = useState(0)

  useEffect(() => {
    if (!resendCooling(now, until)) return
    const timer = window.setTimeout(() => setNow(Date.now()), Math.min(1000, until - Date.now()))
    return () => window.clearTimeout(timer)
  }, [now, until])

  const send = async () => {
    if (!email || pending || resendCooling(Date.now(), until)) return
    setPending(true)
    setError(null)
    const result = await requestVerifyResend(email, authEmailResendVerify)
    setPending(false)
    setError(result.error)
    if (result.toast) toast.show(result.toast)
    if (result.cooldownMs > 0) {
      const stamp = Date.now()
      setNow(stamp)
      setUntil(stamp + result.cooldownMs)
    }
  }

  const cooling = resendCooling(now, until)
  return {
    pending,
    cooling,
    wait: cooling ? Math.ceil((until - now) / 1000) : 0,
    error,
    send,
    toast,
  }
}
