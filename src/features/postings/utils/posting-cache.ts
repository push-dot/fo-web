import type { PostingDetail } from '@push/api-client'
import type { QueryClient } from '@tanstack/react-query'

export const afterPostingSave = async (queryClient: QueryClient, id?: string) => {
  await queryClient.invalidateQueries({ queryKey: ['company-postings'] })
  if (id) {
    await queryClient.removeQueries({ queryKey: ['employer-posting', id] })
  }
}

export const afterPostingClose = async (
  queryClient: QueryClient,
  id: string,
  posting: Pick<PostingDetail, 'revision' | 'closedAt'>,
) => {
  await queryClient.invalidateQueries({ queryKey: ['company-postings'] })
  queryClient.setQueryData<PostingDetail>(['employer-posting', id], (current) =>
    current ? { ...current, revision: posting.revision, closedAt: posting.closedAt } : current,
  )
}

export const afterListPostingClose = async (queryClient: QueryClient, id: string) => {
  await queryClient.invalidateQueries({ queryKey: ['company-postings'] })
  await queryClient.removeQueries({ queryKey: ['employer-posting', id] })
}
