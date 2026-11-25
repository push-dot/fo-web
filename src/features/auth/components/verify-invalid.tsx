import { Link } from 'react-router-dom'
import { AuthResult } from '..'
import {
  PASSWORD_CHANGED_ACTION,
  VERIFY_INVALID_NEXT,
  VERIFY_INVALID_RESTART,
  VERIFY_INVALID_TITLE,
  VERIFY_INVALID_WHY,
} from '../constants'
import { SIGNUP } from './verify-expired'

const LOGIN = '/login?accountType=EMPLOYER'

const VerifyInvalid = () => (
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

export default VerifyInvalid
