import { ApiError, QueueBusyError } from '@push/api-client'

export const retryAfterSec = (error: ApiError) => {
  if (error instanceof QueueBusyError) return error.retryAfterSec
  const value = error.details?.retryAfterSec
  return typeof value === 'number' ? value : undefined
}
