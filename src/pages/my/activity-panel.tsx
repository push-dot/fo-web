import { ApplyPanel, CalendarPanel } from '../../features/applications'
import { BookmarkPanel } from '../../features/postings'
import { ACTIVITY_CHIP_KEY } from './constants'
import { FollowPanel } from '../../features/profile'
import { PostsPanel } from '../../features/social'

const PANELS = {
  applications: ApplyPanel,
  calendar: CalendarPanel,
  bookmarks: BookmarkPanel,
  follows: FollowPanel,
  posts: PostsPanel,
} as const

const ActivityPanel = ({ chip }: { chip: string }) => {
  const Panel = PANELS[ACTIVITY_CHIP_KEY[chip as keyof typeof ACTIVITY_CHIP_KEY]]
  return <Panel />
}

export default ActivityPanel
