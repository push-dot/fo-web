import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { meWebNotifications, meReadNotifications } from './fetchers'
import type { WebNotification } from '@push/api-client'
import { useNavigate } from 'react-router-dom'
import { notificationPath } from '../utils/notification-path'

export const useNotifications = (enabled = true) =>
  useQuery({ queryKey: ['notifications'], queryFn: () => meWebNotifications(), enabled })

export const useNoticeActions = (afterOpen?: () => void) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const read = useMutation({
    mutationFn: (ids: string[] | 'all') => meReadNotifications(ids),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
  const open = async (notice: WebNotification) => {
    await read.mutateAsync([notice.id])
    afterOpen?.()
    const path = notificationPath(notice)
    if (path) navigate(path)
  }
  return { read, open }
}
