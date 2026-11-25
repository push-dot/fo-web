import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authMe, AuthPasswordField, LOGIN_FAILED_COPY, authEmailVerify, verifyOutcome, VerifyExpired, VerifyInvalid, pathAfterAuth } from '../../features/auth'
import { takeSignupReturnTo } from '../../shared/auth/return-path'
import { sessionStore } from '../../shared/auth/session'
import { PASSWORD_LENGTH_COPY } from '../../features/auth'
import { passwordError } from '../../features/auth'
import { CONFIRM_PASSWORD_PLACEHOLDER, PASSWORD_HINT, PASSWORD_LABEL, SET_PASSWORD_CONFIRM_LABEL, SET_PASSWORD_LEAD, SET_PASSWORD_MISMATCH, SET_PASSWORD_SUBMIT, SET_PASSWORD_SUBMITTING, SET_PASSWORD_TITLE } from './constants'

type FormError = { field: 'password' | 'confirm' | 'form'; text: string }

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
