import type { PostCategory } from '@push/api-client'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { meCommentedPosts as fetchCommentedPosts } from '../../../shared/api/operations'
import { postsGet, postsList, postsComments, mePosts } from './fetchers'
import { POPULAR_PARAMS } from '../constants'
import { topByViews } from '../utils/popular-posts'

export const useMyPosts = (enabled = true) =>
  useQuery({ queryKey: ['my-posts'], queryFn: () => mePosts(), enabled })

export const useMyCommentedPosts = (enabled = true) =>
  useQuery({ queryKey: ['my-commented-posts'], queryFn: () => fetchCommentedPosts(), enabled })

export const usePost = (id: string) =>
  useQuery({ queryKey: ['post', id], queryFn: () => postsGet(id) })

export const usePostComments = (id: string) =>
  useQuery({ queryKey: ['comments', id], queryFn: () => postsComments(id) })

export const usePostPages = (category: PostCategory | null, limit: number) =>
  useInfiniteQuery({
    queryKey: ['posts', category],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => postsList(category, { cursor: pageParam, limit }),
    getNextPageParam: (last) =>
      last.page.hasMore ? (last.page.nextCursor ?? undefined) : undefined,
  })

export const usePopularPosts = () =>
  useQuery({
    queryKey: ['posts', 'popular'],
    queryFn: () => postsList(null, POPULAR_PARAMS),
    select: (page) => topByViews(page.data),
  })
