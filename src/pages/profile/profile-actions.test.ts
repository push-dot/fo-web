import { describe, expect, it } from 'vitest'
import { PROFILE_ACTIONS, profileActionMessage } from './profile-actions'

describe('own profile actions in the app', () => {
  it('shows exactly 기본 정보 편집 and PDF로 내보내기', () => {
    expect(PROFILE_ACTIONS.map((a) => a.label)).toEqual(['기본 정보 편집', 'PDF로 내보내기'])
  })

  it('edit opens the basic editor, export asks the app to export this profile', () => {
    expect(profileActionMessage('edit', 'u1')).toEqual({ type: 'open', path: '/(tabs)/(my)/edit-profile/basic' })
    expect(profileActionMessage('export', 'u1')).toEqual({ type: 'export-profile', userId: 'u1' })
  })
})
