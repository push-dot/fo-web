import { useQueryClient, type QueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { authLogout } from '../../shared/api/operations'
import { cookieSession } from '../../shared/auth/cookie-session'
import { sessionStore } from '../../shared/auth/session'

export const signOut = async (queryClient: Pick<QueryClient, 'clear'>, { revoke = true } = {}) => {
  const refreshToken = sessionStore.load()?.refreshToken
  if (revoke && (cookieSession || refreshToken)) await authLogout(cookieSession ? undefined : refreshToken).catch(() => undefined)
  sessionStore.clear()
  queryClient.clear()
}

export const useSignOut = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  return async (options?: { revoke?: boolean }) => {
    await signOut(queryClient, options)
    navigate('/')
  }
}
