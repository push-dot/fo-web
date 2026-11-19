import { ApiError } from '@push/api-client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { sessionStore } from '../shared/auth/session'

// A 4xx answer is final; only network errors and 5xx get the one retry.
export const shouldRetry = (failureCount: number, error: unknown) =>
  !(error instanceof ApiError && error.status < 500) && failureCount < 1

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: shouldRetry, staleTime: 30_000 } } })

// Whatever ends the session (sign-out, failed refresh, re-login) must not leave this account's reads for the next one.
sessionStore.subscribe(() => {
  if (!sessionStore.load()) queryClient.clear()
})

const Providers = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

export default Providers
