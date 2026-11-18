import type { Profile } from '@push/api-client'
import type { WebViewFrom } from '../../shared/lib/bridge'

type Counts = Partial<Pick<Profile, 'followingCount' | 'followerCount' | 'postCount'>>

// MyFollowingProfile draws no counts row; ProfileDetail and ProfileDetailMe do.
export const profileStats = (p: Counts, from?: WebViewFrom) =>
  (from === 'following' ? [] : [
    { value: p.followingCount, label: '팔로잉' },
    { value: p.followerCount, label: '팔로워' },
    { value: p.postCount, label: '게시글' },
  ]).filter((stat): stat is { value: number; label: string } => stat.value != null)
