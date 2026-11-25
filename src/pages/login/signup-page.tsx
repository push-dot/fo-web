import type { Session } from '@push/api-client'
import { ApiError, AccountTypeControl, AuthCheck, LOGIN_FAILED_COPY, TERM_VIEW, TERMS_PRIVACY_POLICY, useOAuthStart, PhoneFlow, VerifyMail, authEmailSignup, useVerifyResend, pathAfterAuth } from '../../features/auth'
import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { withCleanup } from '../../shared/lib/with-cleanup'
import { takeReturnTo } from '../../shared/auth/return-path'
import { sessionStore } from '../../shared/auth/session'
import { EMAIL_TAKEN_EMPLOYER_COPY, EMAIL_TAKEN_PERSONAL_COPY } from '../../features/auth'
import { emailSignupInput, emailTakenCopy } from '../../features/auth'
import Icon from '../../shared/ui/icon'
import Toast from '../../shared/ui/toast'
import { EMAIL_LABEL, LOGIN_SUBMIT_COPY, NAME_LABEL, SIGNUP_EMPLOYER_TITLE, SIGNUP_HAS_ACCOUNT, SIGNUP_LEAD, SIGNUP_SENDING_COPY, SIGNUP_SUBMIT_COPY, TERMS_COLLECTION_LINK, TERMS_LABEL, TERMS_REQUIRED, TERMS_SERVICE_LINK } from './constants'

const SignupPage = () => {
  const [params] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const oauth = useOAuthStart()
  const [employer, setEmployer] = useState(params.get('accountType') === 'EMPLOYER')
  const pendingToken = (location.state as { pendingToken?: string } | null)?.pendingToken

  if (!employer) {
    return (
      <PhoneFlow
        pendingToken={pendingToken}
        onProvider={(provider) => void oauth.start(provider, 'PERSONAL')}
        onDone={(session: Session) => {
          sessionStore.save(session)
          navigate(pathAfterAuth(takeReturnTo(), session), { replace: true })
        }}
      />
    )
  }
  return (
    <EmployerSignup
      initialEmail={params.get('email') ?? ''}
      onPersonal={() => setEmployer(false)}
    />
  )
}

const EmployerSignup = ({
  initialEmail,
  onPersonal,
}: {
  initialEmail: string
  onPersonal: () => void
}) => {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState(initialEmail)
  const [terms, setTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [taken, setTaken] = useState(false)
  const [done, setDone] = useState(false)
  const [pending, setPending] = useState(false)
  const resend = useVerifyResend(email)
  const emailTaken = error === EMAIL_TAKEN_PERSONAL_COPY || error === EMAIL_TAKEN_EMPLOYER_COPY
  const blocked = !terms || taken

  const send = async () => {
    const input = emailSignupInput({ email, accountType: 'EMPLOYER', displayName, terms })
    if (!input) return
    setError(null)
    setPending(true)
    await withCleanup(async () => {
      try {
        await authEmailSignup(input)
        setDone(true)
      } catch (caught) {
        if (caught instanceof ApiError && caught.code === 'EMAIL_TAKEN') {
          setTaken(true)
          setError(emailTakenCopy(caught.details?.accountType))
          return
        }
        setError(LOGIN_FAILED_COPY)
      }
    }, () => setPending(false))
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await send()
  }

  if (done) {
    return (
      <>
        <VerifyMail
          email={email}
          pending={resend.pending || resend.cooling}
          wait={resend.wait}
          error={resend.error}
          onResend={() => void resend.send()}
          onEdit={() => {
            setDone(false)
            setError(null)
            setTaken(false)
          }}
        />
        <Toast message={resend.toast.message} tone={resend.toast.tone} />
      </>
    )
  }

  return (
    <main className="auth-card">
      <header className="auth-lead">
        <h1>{SIGNUP_EMPLOYER_TITLE}</h1>
        <p>{SIGNUP_LEAD}</p>
      </header>
      <AccountTypeControl
        value="EMPLOYER"
        onChange={(next) => next === 'PERSONAL' && onPersonal()}
      />
      <form className="auth-stack" onSubmit={(event) => void submit(event)}>
        <label className="auth-block">
          <span className="auth-label">{NAME_LABEL}</span>
          <span className="auth-control">
            <input
              value={displayName}
              autoComplete="name"
              required
              onChange={(event) => setDisplayName(event.target.value)}
            />
          </span>
        </label>
        <label className="auth-block">
          <span className="auth-label">{EMAIL_LABEL}</span>
          <span className={emailTaken ? 'auth-control err' : 'auth-control'}>
            <input
              type="email"
              value={email}
              autoComplete="email"
              required
              aria-invalid={emailTaken ? true : undefined}
              onChange={(event) => {
                setEmail(event.target.value)
                if (taken) {
                  setTaken(false)
                  setError(null)
                }
              }}
            />
            {emailTaken ? <Icon name="warn" size={20} className="auth-warn" /> : null}
          </span>
          {emailTaken ? (
            <span className="auth-error" role="alert">
              {error}
            </span>
          ) : null}
        </label>
        <div className="auth-consents">
          <AuthCheck checked={terms} onChange={setTerms}>
            <span>
              <span className="auth-check-title">
                {TERMS_LABEL}
                <span className="auth-req">{TERMS_REQUIRED}</span>
              </span>
            </span>
          </AuthCheck>
          <span className="auth-legal-links">
            <a href="/terms" target="_blank" rel="noreferrer">
              {TERMS_SERVICE_LINK}
            </a>
            <a href={TERM_VIEW.privacy} target="_blank" rel="noreferrer">
              {TERMS_COLLECTION_LINK}
            </a>
            <a href="/privacy" target="_blank" rel="noreferrer">
              {TERMS_PRIVACY_POLICY}
            </a>
          </span>
        </div>
        {error && !emailTaken ? (
          <p className="auth-error" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          className={blocked ? 'auth-btn pri dis' : 'auth-btn pri'}
          disabled={blocked || pending}
        >
          {pending ? SIGNUP_SENDING_COPY : SIGNUP_SUBMIT_COPY}
        </button>
      </form>
      <p className="auth-foot">
        {SIGNUP_HAS_ACCOUNT} <Link to="/login?accountType=EMPLOYER">{LOGIN_SUBMIT_COPY}</Link>
      </p>
    </main>
  )
}

export default SignupPage
