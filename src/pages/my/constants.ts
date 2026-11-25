export const PERSONAL_MY_TABS = ['프로필', '서류', '내 활동'] as const

export const EMPLOYER_MY_TABS = ['회사 정보', '내 활동'] as const

export const PERSONAL_ACTIVITY_CHIPS = ['지원활동', '캘린더', '북마크', '팔로우', '게시글'] as const

export const EMPLOYER_ACTIVITY_CHIPS = ['북마크', '팔로우', '게시글'] as const

export const MY_TAB_KEY = {
  프로필: 'profile',
  서류: 'documents',
  '내 활동': 'activity',
  '회사 정보': 'company',
} as const

export const ACTIVITY_CHIP_KEY = {
  지원활동: 'applications',
  캘린더: 'calendar',
  북마크: 'bookmarks',
  팔로우: 'follows',
  게시글: 'posts',
} as const

export const PROFILE_EDIT_TITLE = '프로필 편집'
