import { describe, expect, it } from 'vitest'

import { opensUp } from './popover'

describe('opensUp', () => {
  it('opens a menu above its button when it would run past the bottom of the window', () => {
    expect(opensUp({ top: 820, bottom: 960 }, { top: 776 }, 900)).toBe(true)
  })

  it('keeps it below when it fits, or when there is no room above either', () => {
    expect(opensUp({ top: 300, bottom: 440 }, { top: 256 }, 900)).toBe(false)
    expect(opensUp({ top: 100, bottom: 960 }, { top: 56 }, 900)).toBe(false)
  })

  it('counts the 64px tab bar when the window is 1024px or narrower', () => {
    expect(opensUp({ top: 700, bottom: 850 }, { top: 692 }, 900, 1024)).toBe(true)
    expect(opensUp({ top: 700, bottom: 850 }, { top: 692 }, 900, 800)).toBe(true)
    expect(opensUp({ top: 700, bottom: 850 }, { top: 692 }, 900, 1025)).toBe(false)
    expect(opensUp({ top: 700, bottom: 850 }, { top: 692 }, 900)).toBe(false)
    expect(opensUp({ top: 40, bottom: 860 }, { top: 20 }, 900, 800)).toBe(false)
  })
})
