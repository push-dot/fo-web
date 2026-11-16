import { ApiError } from '@push/api-client'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { authMe } from '../../entities/session'
import { pathAfterAuth, takeSignupReturnTo } from '../../shared/auth/return-path'
import { sessionStore } from '../../shared/auth/session'
import { PASSWORD_LENGTH_COPY } from '../../shared/model/constants'
import { passwordError } from '../../shared/model/login-providers'
import AuthPasswordField from './auth-password-field'
import AuthResult from './auth-result'
import {
  CONFIRM_PASSWORD_PLACEHOLDER,
  LOGIN_FAILED_COPY,
  PASSWORD_CHANGED_ACTION,
  PASSWORD_HINT,
  PASSWORD_LABEL,
  SET_PASSWORD_CONFIRM_LABEL,
  SET_PASSWORD_LEAD,
  SET_PASSWORD_MISMATCH,
  SET_PASSWORD_SUBMIT,
  SET_PASSWORD_SUBMITTING,
  SET_PASSWORD_TITLE,
  VERIFY_EXPIRED_NEXT,
  VERIFY_EXPIRED_TITLE,
  VERIFY_EXPIRED_TO,
  VERIFY_EXPIRED_WHY,
  VERIFY_INVALID_NEXT,
  VERIFY_INVALID_RESTART,
  VERIFY_INVALID_TITLE,
  VERIFY_INVALID_WHY,
  VERIFY_MAIL_OTHER,
  VERIFY_MAIL_RESEND,
} from './constants'
import { authEmailVerify } from '../../features/verify-email'
import Toast from '../../shared/ui/toast'
import { useVerifyResend } from './verify-resend'
import { verifyOutcome } from './verify-outcome'

const SIGNUP = '/signup?accountType=EMPLOYER'
const LOGIN = '/login?accountType=EMPLOYER'

export const VerifyExpired = ({ email }: { email: string }) => {
  const resend = useVerifyResend(email)
  const quiet = resend.pending || resend.cooling || !email
  return (
    <main className="auth-card">
      <AuthResult icon="clock" tone="grey" title={VERIFY_EXPIRED_TITLE}>
        {VERIFY_EXPIRED_WHY}
        <br />
        {VERIFY_EXPIRED_NEXT}
      </AuthResult>
      {email ? (
        <div className="auth-note-card tight">
          <span>{VERIFY_EXPIRED_TO}</span>
          <strong>{email}</strong>
        </div>
      ) : null}
      {resend.error ? (
        <p className="auth-error" role="alert">
          {resend.error}
        </p>
      ) : null}
      <button
        type="button"
        className={quiet ? 'auth-btn pri dis' : 'auth-btn pri'}
        disabled={quiet}
        onClick={() => void resend.send()}
      >
        {VERIFY_MAIL_RESEND}
      </button>
      <Link className="auth-text" to={SIGNUP}>
        {VERIFY_MAIL_OTHER}
      </Link>
      <Toast message={resend.toast.message} tone={resend.toast.tone} />
    </main>
  )
}

export const VerifyInvalid = () => (
  <main className="auth-card">
    <AuthResult icon="link" tone="grey" title={VERIFY_INVALID_TITLE}>
      {VERIFY_INVALID_WHY}
      <br />
      {VERIFY_INVALID_NEXT}
    </AuthResult>
    <Link className="auth-btn pri" to={LOGIN}>
      {PASSWORD_CHANGED_ACTION}
    </Link>
    <Link className="auth-text" to={SIGNUP}>
      {VERIFY_INVALID_RESTART}
    </Link>
  </main>
)

type FormError = { field: 'password' | 'confirm' | 'form'; text: string }

// The person who opens the mailed link chooses the password, so a second signup for the same address cannot set it.
const VerifyPage = () => {
  const [params] = useSearchParams()
  const token = params.get('token')
  const navigate = useNavigate()
  const [view, setView] = useState<'form' | 'invalid'>(token ? 'form' : 'invalid')
  const [expired, setExpired] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<FormError | null>(null)
  const [pending, setPending] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const invalid = passwordError(password)
    if (invalid) return setError({ field: 'password', text: invalid })
    if (confirm !== password) return setError({ field: 'confirm', text: SET_PASSWORD_MISMATCH })
    if (!token) return
    setError(null)
    setPending(true)
    try {
      const session = await authEmailVerify(token, password)
      sessionStore.save(session)
      // The session carries no email; the saved return path is used only for the address it was saved for.
      const email = await authMe().then(
        (me) => me.email,
        () => '',
      )
      navigate(pathAfterAuth(takeSignupReturnTo(email), session), { replace: true })
    } catch (caught) {
      const outcome = verifyOutcome(caught)
      if (outcome.view === 'expired') setExpired(outcome.email)
      else if (outcome.view === 'invalid') setView('invalid')
      else setError({ field: outcome.field, text: outcome.field === 'password' ? PASSWORD_LENGTH_COPY : LOGIN_FAILED_COPY })
      setPending(false)
    }
  }

  if (expired !== null) return <VerifyExpired email={expired} />
  if (view === 'invalid') return <VerifyInvalid />

  return (
    <main className="auth-card">
      <header className="auth-lead">
        <h1>{SET_PASSWORD_TITLE}</h1>
        <p>{SET_PASSWORD_LEAD}</p>
      </header>
      <form className="auth-stack" noValidate onSubmit={(event) => void submit(event)}>
        <AuthPasswordField
          label={PASSWORD_LABEL}
          value={password}
          onChange={(value) => {
            setPassword(value)
            if (error?.field === 'password') setError(null)
          }}
          autoComplete="new-password"
          hint={PASSWORD_HINT}
          error={error?.field === 'password' ? error.text : null}
        />
        <AuthPasswordField
          label={SET_PASSWORD_CONFIRM_LABEL}
          value={confirm}
          onChange={(value) => {
            setConfirm(value)
            if (error?.field === 'confirm') setError(null)
          }}
          autoComplete="new-password"
          placeholder={CONFIRM_PASSWORD_PLACEHOLDER}
          error={error?.field === 'confirm' ? error.text : null}
        />
        {error?.field === 'form' ? (
          <p className="auth-error" role="alert">
            {error.text}
          </p>
        ) : null}
        <button type="submit" className={pending || !password || !confirm ? 'auth-btn pri dis' : 'auth-btn pri'} disabled={pending}>
          {pending ? SET_PASSWORD_SUBMITTING : SET_PASSWORD_SUBMIT}
        </button>
      </form>
    </main>
  )
}

export default VerifyPage
