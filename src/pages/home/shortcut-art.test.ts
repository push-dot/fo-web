import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { SHORTCUT_ART } from './constants'

describe('shortcut art', () => {
  it('draws the design system 3D icons instead of local hex colours', () => {
    expect(readFileSync(new URL('./shortcut-art.tsx', import.meta.url), 'utf8')).not.toMatch(/#[0-9a-f]{3,8}\b/i)
    expect(SHORTCUT_ART.jobs).toContain('q3b1')
    expect(SHORTCUT_ART.bookmarks).toContain('q3k1')
    expect(SHORTCUT_ART.activity).toContain('q3c1')
  })
})
