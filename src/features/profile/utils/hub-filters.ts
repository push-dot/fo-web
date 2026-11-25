import type { JobCategory } from '@push/api-client'
import type { HubDraft } from '../types'

export const countApplied = (draft: HubDraft) => (draft.tenure ? 1 : 0) + (draft.status ? 1 : 0)

export const profileFilters = (categories: JobCategory[], draft: HubDraft) => ({
  category: categories.length > 0 ? categories : undefined,
  tenure: draft.tenure ? [draft.tenure] : undefined,
  status: draft.status ? [draft.status] : undefined,
})
