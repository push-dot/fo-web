import { describe, expect, it } from 'vitest'
import { ACCESS_MODES, shownAccessMode } from '../constants'

describe('shownAccessMode', () => {
  it('offers no mode that skips the approval card', () => {
    expect(ACCESS_MODES.map((mode) => mode.value)).toEqual(['ALWAYS_ASK', 'AUTO'])
  })

  it('shows a saved bypass as auto, since the company agent asks before outside writes', () => {
    expect(shownAccessMode('BYPASS')).toBe('AUTO')
    expect(shownAccessMode(undefined)).toBe('AUTO')
    expect(shownAccessMode('ALWAYS_ASK')).toBe('ALWAYS_ASK')
  })
})
