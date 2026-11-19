import { ApiError } from '@push/api-client'
import { describe, expect, it } from 'vitest'

import { shouldRetry } from './providers'

describe('shouldRetry', () => {
  it('never retries a 4xx', () => {
    expect(shouldRetry(0, new ApiError('no', 'NOT_FOUND', 404))).toBe(false)
  })
  it('retries a 5xx or network error once', () => {
    expect(shouldRetry(0, new ApiError('x', 'INTERNAL', 503))).toBe(true)
    expect(shouldRetry(0, new TypeError('fetch failed'))).toBe(true)
    expect(shouldRetry(1, new TypeError('fetch failed'))).toBe(false)
  })
})
