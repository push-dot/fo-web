import { describe, expect, it } from 'vitest'
import { APPLICATION_EMPTY } from '../../features/applications'
import { BOOKMARK_EMPTY } from '../../features/postings'
import { FOLLOW_EMPTY } from '../../features/profile'
import { POST_EMPTY } from '../../features/social'

describe('activity empty lines', () => {
  it('activity empty lines end with a period', () => {
    expect(APPLICATION_EMPTY).toBe('아직 지원한 공고가 없어요.')
    expect(BOOKMARK_EMPTY).toBe('북마크한 공고가 없어요.')
    expect(FOLLOW_EMPTY).toBe('아직 팔로우한 사람이 없어요.')
    expect(POST_EMPTY).toBe('아직 쓴 글이 없어요.')
  })
})
