import { useQuery } from '@tanstack/react-query'
import { searchCatalog } from './fetchers'

export const useSearchPostings = (q: string, enabled: boolean) =>
  useQuery({
    queryKey: ['search', 'postings', q],
    queryFn: () => searchCatalog(q, 'postings'),
    enabled,
  })

export const useSearchPeople = (q: string, enabled: boolean) =>
  useQuery({
    queryKey: ['search', 'people', q],
    queryFn: () => searchCatalog(q, 'people'),
    enabled,
  })

export const useSearchPosts = (q: string, enabled: boolean) =>
  useQuery({ queryKey: ['search', 'posts', q], queryFn: () => searchCatalog(q, 'posts'), enabled })
