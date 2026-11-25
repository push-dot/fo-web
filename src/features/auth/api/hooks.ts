import { useQuery } from '@tanstack/react-query'
import { meBlocks as fetchBlocks } from '../../../shared/api/operations'
import { authMe, meSettings } from './fetchers'

export const useAuthMe = (enabled = true) =>
  useQuery({ queryKey: ['auth', 'me'], queryFn: () => authMe(), enabled })

export const useSettings = () => useQuery({ queryKey: ['settings'], queryFn: () => meSettings() })

export const useBlocks = (enabled = true) =>
  useQuery({ queryKey: ['blocks'], queryFn: () => fetchBlocks(), enabled })
