import { ApiError } from '@push/api-client'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { useEffect } from 'react'
import { send } from './bridge'
import { releaseAfterFonts } from './hold-for-fonts'

const STORE_PREFIX = 'push:detail:'

// A detail page the app opens again draws from the last answer at once (a new web view has no memory) and refreshes behind it.
const read = <T extends object>(key: string): T | undefined => {
  try {
    const raw = localStorage.getItem(STORE_PREFIX + key)
    return raw ? (JSON.parse(raw) as T) : undefined
  } catch {
    return undefined
  }
}

const write = (key: string, data: unknown) => {
  try {
    localStorage.setItem(STORE_PREFIX + key, JSON.stringify(data))
  } catch {
    // Full or blocked storage: the page just loads like the first time.
  }
}

export const useDetail = <T extends object>(key: unknown[], load: () => Promise<T>, titleOf: (data: T) => string) => {
  const id = JSON.stringify(key)
  const q = useQuery({
    queryKey: key,
    queryFn: async () => {
      const data = await load()
      write(id, data)
      return data
    },
    // The query's data type is the loader's; a stored answer has the same shape.
    placeholderData: (() => read<T>(id)) as () => never,
  }) as UseQueryResult<T>
  const title = q.data ? titleOf(q.data) : undefined
  useEffect(() => {
    if (!title) return
    send({ type: 'title', title })
    releaseAfterFonts()
  }, [title])
  useEffect(() => {
    if (q.error) send({ type: 'error', status: q.error instanceof ApiError ? q.error.status : 0 })
  }, [q.error])
  return q
}
