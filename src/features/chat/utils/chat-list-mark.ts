import type { ConversationStatus } from '@push/api-client'

export const chatListMark = (
  status: ConversationStatus,
): { label: string; tone: 'ac' | 'orange' } | null => {
  if (status === 'RUNNING') return { label: '작업 중', tone: 'ac' }
  if (status === 'NEEDS_APPROVAL') return { label: '확인 필요', tone: 'orange' }
  return null
}
