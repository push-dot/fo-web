import type { CareerStatus } from '@push/api-client'

export const careerStatusTone = (status: CareerStatus | null | undefined) => {
  if (status === 'seeking') return 'green'
  if (status === 'feedback') return 'orange'
  return 'grey'
}
