import type { BridgeMessage } from '../../shared/lib/bridge'

export const PROFILE_ACTIONS = [
  { key: 'edit', label: '기본 정보 편집' },
  { key: 'export', label: 'PDF로 내보내기' },
] as const

export const profileActionMessage = (key: (typeof PROFILE_ACTIONS)[number]['key'], userId: string): BridgeMessage =>
  key === 'edit' ? { type: 'open', path: '/(tabs)/(my)/edit-profile/basic' } : { type: 'export-profile', userId }
