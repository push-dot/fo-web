import { useQuery } from '@tanstack/react-query'
import { companiesInvites, companiesMembers as fetchMembers } from '../../shared/api/operations'

export const companiesMembers = (...args: Parameters<typeof fetchMembers>) => fetchMembers(...args)

export const useCompanyMembers = (options?: { enabled?: boolean }) =>
  useQuery({ queryKey: ['company', 'members'], queryFn: () => companiesMembers(), ...(options ?? {}) })

export const useCompanyInvites = (enabled = true) =>
  useQuery({ queryKey: ['company', 'invites'], queryFn: () => companiesInvites(), enabled })
