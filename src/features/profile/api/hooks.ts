import type { LinkKind } from '@push/api-client'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { listSources } from '../../../shared/api/sources'
import { profilesList, meProfile, meLinks, meFollows } from './fetchers'

export const useMyProfile = (enabled = true) =>
  useQuery({ queryKey: ['me', 'profile'], queryFn: () => meProfile(), enabled })

export const useFollows = (enabled = true) =>
  useQuery({ queryKey: ['follows'], queryFn: () => meFollows(), enabled })

export const useSources = () => useQuery({ queryKey: ['sources'], queryFn: () => listSources() })

export const useLinks = (kind: LinkKind | 'all') =>
  useQuery({
    queryKey: ['links', kind],
    queryFn: () => meLinks(kind === 'all' ? undefined : kind),
  })

export const useProfilePages = (queryKey: unknown[], query: Parameters<typeof profilesList>[0]) =>
  useInfiniteQuery({
    queryKey,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => profilesList({ ...query, cursor: pageParam }),
    getNextPageParam: (last) =>
      last.page.hasMore ? (last.page.nextCursor ?? undefined) : undefined,
  })
