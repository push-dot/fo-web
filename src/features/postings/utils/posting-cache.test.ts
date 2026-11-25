import type { PostingDetail } from '@push/api-client'
import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'

import { afterListPostingClose, afterPostingClose, afterPostingSave } from './posting-cache'

const detail = (revision: number): PostingDetail =>
  ({
    id: 'p1',
    revision,
    title: '공고',
    closedAt: null,
  }) as PostingDetail

describe('posting cache sync', () => {
  it('drops cached employer detail after a successful edit save', async () => {
    const queryClient = new QueryClient()
    queryClient.setQueryData(['employer-posting', 'p1'], detail(1))
    const remove = vi.spyOn(queryClient, 'removeQueries')
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    await afterPostingSave(queryClient, 'p1')
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['company-postings'] })
    expect(remove).toHaveBeenCalledWith({ queryKey: ['employer-posting', 'p1'] })
  })

  it('only refreshes the list after creating a posting', async () => {
    const queryClient = new QueryClient()
    const remove = vi.spyOn(queryClient, 'removeQueries')
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    await afterPostingSave(queryClient)
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['company-postings'] })
    expect(remove).not.toHaveBeenCalled()
  })

  it('bumps revision on cached detail when the editor closes a posting', async () => {
    const queryClient = new QueryClient()
    queryClient.setQueryData(['employer-posting', 'p1'], detail(3))
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    await afterPostingClose(queryClient, 'p1', { revision: 4, closedAt: '2026-01-02T00:00:00.000Z' })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['company-postings'] })
    const cached = queryClient.getQueryData<PostingDetail>(['employer-posting', 'p1'])
    expect(cached?.revision).toBe(4)
    expect(cached?.closedAt).toBe('2026-01-02T00:00:00.000Z')
    expect(cached?.title).toBe('공고')
  })

  it('drops employer detail when a posting is closed from the list', async () => {
    const queryClient = new QueryClient()
    queryClient.setQueryData(['employer-posting', 'p1'], detail(2))
    const remove = vi.spyOn(queryClient, 'removeQueries')
    await afterListPostingClose(queryClient, 'p1')
    expect(remove).toHaveBeenCalledWith({ queryKey: ['employer-posting', 'p1'] })
  })
})
