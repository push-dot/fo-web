import { describe, expect, it } from 'vitest'

import { postCategoryLabel } from './category-label'

describe('postCategoryLabel', () => {
  it('returns the configured label or the raw key', () => {
    expect(postCategoryLabel('career')).toBe('커리어')
    expect(postCategoryLabel('unknown' as 'career')).toBe('unknown')
  })
})
