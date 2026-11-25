import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'
import { conversationsList, conversationsMessages, conversationsTurns } from './fetchers'
import type { AccessMode, Settings } from '@push/api-client'
import { useSettings } from '../../auth'
import { meUpdateSettings } from '../../../shared/api/operations'
import { shownAccessMode } from '../constants'

export const useEmployerConversations = () =>
  useQuery({
    queryKey: ['employer-conversations'],
    queryFn: () => conversationsList({ audience: 'EMPLOYER' }),
  })

const olderPage = (last: { page: { hasMore: boolean; nextCursor: string | null } }) =>
  last.page.hasMore ? (last.page.nextCursor ?? undefined) : undefined

export const useEmployerMessages = (id: string | undefined) =>
  useInfiniteQuery({
    queryKey: ['employer-messages', id],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => conversationsMessages(id ?? '', { cursor: pageParam }),
    getNextPageParam: olderPage,
    enabled: Boolean(id),
  })

export const useEmployerTurns = (id: string | undefined) =>
  useInfiniteQuery({
    queryKey: ['employer-turns', id],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => conversationsTurns(id ?? '', { cursor: pageParam }),
    getNextPageParam: olderPage,
    enabled: Boolean(id),
  })

const SETTINGS_KEY = ['settings']

export const accessModeMutation = (
  client: Pick<QueryClient, 'cancelQueries' | 'getQueryData' | 'setQueryData'>,
  save: (mode: AccessMode) => Promise<Settings>,
) => ({
  mutationFn: save,
  onMutate: async (mode: AccessMode) => {
    await client.cancelQueries({ queryKey: SETTINGS_KEY })
    const previous = client.getQueryData<Settings>(SETTINGS_KEY)
    if (previous) client.setQueryData<Settings>(SETTINGS_KEY, { ...previous, aiAccessMode: mode })
    return { previous }
  },
  onError: (_error: unknown, _mode: AccessMode, context?: { previous?: Settings }) => {
    if (context?.previous) client.setQueryData(SETTINGS_KEY, context.previous)
  },
  onSuccess: (next: Settings) => client.setQueryData(SETTINGS_KEY, next),
})

export const useAccessMode = () => {
  const client = useQueryClient()
  const settings = useSettings()
  const save = useMutation(
    accessModeMutation(client, (mode) => meUpdateSettings({ aiAccessMode: mode })),
  )
  const accessMode = shownAccessMode(settings.data?.aiAccessMode)
  return { accessMode, pick: save.mutate }
}
