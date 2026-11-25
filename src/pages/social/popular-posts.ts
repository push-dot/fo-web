import type { Post, PostsListParams } from '@push/api-client'
import { useQuery } from '@tanstack/react-query'

import { postsList } from '../../entities/post'
import { POPULAR_COUNT, POPULAR_FETCH } from './constants'

export const POPULAR_PARAMS: PostsListParams = { limit: POPULAR_FETCH, sort: 'popular', period: 'week' }

export const topByViews = (posts: Post[]) => [...posts].sort((a, b) => b.viewCount - a.viewCount).slice(0, POPULAR_COUNT)

export const usePopularPosts = () =>
  useQuery({ queryKey: ['posts', 'popular'], queryFn: () => postsList(null, POPULAR_PARAMS), select: (page) => topByViews(page.data) })
