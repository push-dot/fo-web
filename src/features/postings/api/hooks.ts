import { withDeadlineWindow } from '@push/api-client'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { postingsGet, postingsList, postingsLocations, postingsMine, meBookmarks } from './fetchers'

export const usePostingList = (sort: 'latest' | 'deadline' | 'popular') => {
  const query = withDeadlineWindow({ sort })
  return useQuery({
    queryKey: ['postings', query],
    queryFn: () => postingsList(query),
  })
}

export const useMyPostings = () =>
  useQuery({ queryKey: ['company-postings'], queryFn: () => postingsMine() })

export const useBookmarks = (enabled = true) =>
  useQuery({ queryKey: ['bookmarks'], queryFn: () => meBookmarks(), enabled })

export const useEmployerPosting = (id: string | undefined) =>
  useQuery({
    queryKey: ['employer-posting', id],
    queryFn: () => postingsGet(id ?? ''),
    enabled: Boolean(id),
  })

export const usePostingPages = (
  queryKey: unknown[],
  query: Parameters<typeof postingsList>[0],
  enabled = true,
) =>
  useInfiniteQuery({
    queryKey,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => postingsList({ ...query, cursor: pageParam }),
    getNextPageParam: (last) =>
      last.page.hasMore ? (last.page.nextCursor ?? undefined) : undefined,
    enabled,
  })

export const usePostingCount = (
  queryKey: unknown[],
  query: Parameters<typeof postingsList>[0],
  enabled: boolean,
) => useQuery({ queryKey, queryFn: () => postingsList(query), enabled })

export const usePostingLocations = (
  queryKey: unknown[],
  query: Parameters<typeof postingsLocations>[0],
  enabled: boolean,
) => useQuery({ queryKey, queryFn: () => postingsLocations(query), enabled })
