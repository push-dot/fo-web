import type { Post } from '@push/api-client'
import { POPULAR_COUNT } from '../constants'

export const topByViews = (posts: Post[]) =>
  [...posts].sort((a, b) => b.viewCount - a.viewCount).slice(0, POPULAR_COUNT)
