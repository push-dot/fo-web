import { ApiError } from '@push/api-client'
import { useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { nativeDetailFor, onNativeDetail, send } from './bridge'
import { releaseAfterFonts } from './hold-for-fonts'

const STORE_PREFIX = 'push:detail:'

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
  }
}

export const useDetail = <T extends object>(key: unknown[], load: () => Promise<T>, titleOf: (data: T) => string) => {
  const id = JSON.stringify(key)
  const qc = useQueryClient()
  const { pathname } = useLocation()
  const native = nativeDetailFor(pathname)
  const q = useQuery({
    queryKey: key,
    queryFn: async () => {
      const data = await load()
      write(id, data)
      return data
    },
    initialData: native?.data as T | undefined,
    initialDataUpdatedAt: native?.updatedAt,
    placeholderData: (() => read<T>(id)) as () => never,
  }) as UseQueryResult<T>
  useEffect(
    () =>
      onNativeDetail((detail) => {
        const queryKey = JSON.parse(id) as unknown[]
        if (detail.path === pathname && qc.getQueryData(queryKey) === undefined) qc.setQueryData(queryKey, detail.data, { updatedAt: detail.updatedAt })
      }),
    [qc, pathname, id],
  )
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
