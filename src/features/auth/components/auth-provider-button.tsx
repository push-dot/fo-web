import type { ReactNode } from 'react'
import { PROVIDER_START_LABEL } from '../constants'
import ProviderMark from './provider-mark'
import type { ButtonProvider } from '../types'

const AuthProviderButton = ({
  provider,
  disabled,
  onClick,
  children,
}: {
  provider: ButtonProvider
  disabled?: boolean
  onClick: () => void
  children?: ReactNode
}) => (
  <button
    type="button"
    className={provider === 'apple' ? 'auth-btn ink' : 'auth-btn line'}
    disabled={disabled}
    onClick={onClick}
  >
    {children ?? (
      <span className="auth-btn-col">
        <ProviderMark provider={provider} />
        {PROVIDER_START_LABEL[provider]}
      </span>
    )}
  </button>
)

export default AuthProviderButton
