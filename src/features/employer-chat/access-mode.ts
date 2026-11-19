import type { AccessMode, Settings } from '@push/api-client'
import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { useSettings } from '../../entities/session'
import { meUpdateSettings } from '../../shared/api/operations'
import { DEFAULT_ACCESS_MODE } from './constants'

const SETTINGS_KEY = ['settings']

/** Optimistic save of the access mode on the cached settings: the picker moves at once and snaps back when the save fails. */
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
  const accessMode: AccessMode = settings.data?.aiAccessMode ?? DEFAULT_ACCESS_MODE
  return { accessMode, pick: save.mutate }
}
