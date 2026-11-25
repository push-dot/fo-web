import type { LoginProvider, OAuthProvider } from '../../shared/model/login-providers'

export type ButtonProvider = Exclude<LoginProvider, 'email'>

export type ResultTone = 'ac' | 'green' | 'grey' | 'red'

export type LoginState = { failed?: OAuthProvider; detail?: string } | null
