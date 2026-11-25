import type { Session } from '@push/api-client'
import { ApiError, authExchange, ProviderMark, PROVIDER_NAME, clearPendingLogin, readPendingLogin, PhoneConsent, termsPending, pathAfterAuth } from '../../features/auth'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { takePkceVerifier } from '../../shared/auth/pkce'
import { takeReturnTo } from '../../shared/auth/return-path'
import { sessionStore } from '../../shared/auth/session'
import { emailTakenCopy } from '../../features/auth'
import { EXCHANGE_CANCEL, EXCHANGE_EMPLOYER, EXCHANGE_PERSONAL, EXCHANGE_TAIL } from './constants'
import type { LoginState } from '../../features/auth'

const failureDetail = (caught: unknown) => {
  if (caught instanceof ApiError && caught.code === 'EMAIL_TAKEN') return emailTakenCopy(caught.details?.accountType)
  return undefined
}

const CallbackPage = () => {
  const [params] = useSearchParams()
  const code = params.get('code')
  const navigate = useNavigate()
  const started = useRef(false)
  const [{ provider, accountType }] = useState(() => readPendingLogin(params))
  const [consent, setConsent] = useState<Session | null>(null)
  const loginPath = accountType === 'EMPLOYER' ? '/login?accountType=EMPLOYER' : '/login'
  const finish = (session: Session) => {
    sessionStore.save(session)
    navigate(pathAfterAuth(takeReturnTo(), session), { replace: true })
  }

  useEffect(() => {
    if (started.current) return
    started.current = true
    const fail = (detail?: string) => {
      clearPendingLogin()
      const state: LoginState = { failed: provider, detail }
      navigate(loginPath, { replace: true, state })
    }
    const verifier = takePkceVerifier()
    if (!code || !verifier) {
      fail()
      return
    }
    const run = async () => {
      try {
        const result = await authExchange({ code, codeVerifier: verifier })
        clearPendingLogin()
        if ('accessToken' in result) {
          if (await termsPending(result)) setConsent(result)
          else finish(result)
          return
        }
        navigate('/signup', { replace: true, state: { pendingToken: result.pendingToken } })
      } catch (caught) {
        fail(failureDetail(caught))
      }
    }
    void run()
  }, [code, finish, loginPath, navigate, provider])

  if (consent) return <PhoneConsent session={consent} onDone={finish} />

  return (
    <main className="auth-card" aria-busy="true">
      <div className="auth-center auth-wait">
        <span className="auth-ring" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3a9 9 0 0 1 9 9" />
          </svg>
          <ProviderMark provider={provider} />
        </span>
        <h2 className="h2">{`${PROVIDER_NAME[provider]}${EXCHANGE_TAIL}`}</h2>
        <p>{accountType === 'EMPLOYER' ? EXCHANGE_EMPLOYER : EXCHANGE_PERSONAL}</p>
      </div>
      <Link className="auth-text" to={loginPath} onClick={clearPendingLogin}>
        {EXCHANGE_CANCEL}
      </Link>
    </main>
  )
}

export default CallbackPage
