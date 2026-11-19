import { LEGAL_OPERATOR } from '@push/shared'
import { describe, expect, it } from 'vitest'

import { FOOTER_BUSINESS } from './constants'

describe('FOOTER_BUSINESS', () => {
  it('shows every business detail a payment review asks for', () => {
    if (LEGAL_OPERATOR.kind !== 'business') throw new Error('operator must be a business')
    const text = FOOTER_BUSINESS.join(' ')
    for (const value of [
      LEGAL_OPERATOR.tradeName,
      LEGAL_OPERATOR.representative,
      LEGAL_OPERATOR.businessNumber,
      LEGAL_OPERATOR.address,
      LEGAL_OPERATOR.phone,
    ]) {
      expect(text).toContain(value)
    }
  })
})
