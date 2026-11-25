import { describe, expect, it } from 'vitest'

import { careerStatusTone } from './career-status'

describe('careerStatusTone', () => {
  it('maps career status to badge tones', () => {
    expect(careerStatusTone('seeking')).toBe('green')
    expect(careerStatusTone('feedback')).toBe('orange')
    expect(careerStatusTone('satisfied')).toBe('grey')
    expect(careerStatusTone(null)).toBe('grey')
    expect(careerStatusTone(undefined)).toBe('grey')
  })
})
