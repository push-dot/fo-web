import { Link } from 'react-router-dom'
import {
  AuthResult,
  VERIFY_MAIL_OTHER,
  VERIFY_MAIL_RESEND,
  verifyResendWait,
  useVerifyResend,
} from '..'
import {
  VERIFY_EXPIRED_NEXT,
  VERIFY_EXPIRED_TITLE,
  VERIFY_EXPIRED_TO,
  VERIFY_EXPIRED_WHY,
} from '../constants'
import Toast from '../../../shared/ui/toast'

export const SIGNUP = '/signup?accountType=EMPLOYER'

const VerifyExpired = ({ email }: { email: string }) => {
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
        {resend.wait > 0 ? verifyResendWait(resend.wait) : VERIFY_MAIL_RESEND}
      </button>
      <Link className="auth-text" to={SIGNUP}>
        {VERIFY_MAIL_OTHER}
      </Link>
      <Toast message={resend.toast.message} tone={resend.toast.tone} />
    </main>
  )
}

export default VerifyExpired
