import type { A2uiAnswerContext, A2uiResultActionId } from '@push/api-client'
import { A2UI_ACTION } from '../../shared/a2ui/constants'
import type { SurfaceAction } from '../../shared/a2ui'

export type SurfaceHandlers = {
  waiting: string | undefined
  answer: (surfaceId: string, body: A2uiAnswerContext) => void
  openPosting?: (postingId: string) => void
  openPlan?: () => void
  change?: (optionId: string) => void
  openReview?: (documentId: string) => void
  share?: (documentId: string) => void
  result?: Partial<Record<A2uiResultActionId, () => void>>
}

const RESULT_IDS: readonly A2uiResultActionId[] = ['apply', 'convert', 'view', 'retry_save']

const text = (value: unknown) => (typeof value === 'string' && value ? value : undefined)

export const routeSurfaceAction = (action: SurfaceAction, handlers: SurfaceHandlers) => {
  const context: Record<string, unknown> = action.context ?? {}
  switch (action.name) {
    case A2UI_ACTION.answer: {
      const optionId = text(context.optionId)
      if (!optionId || action.surfaceId !== handlers.waiting) return
      const optionIds = Array.isArray(context.optionIds)
        ? context.optionIds.filter((id) => typeof id === 'string')
        : []
      handlers.answer(action.surfaceId, optionIds.length ? { optionId, optionIds } : { optionId })
      return
    }
    case A2UI_ACTION.openPosting: {
      const postingId = text(context.postingId)
      if (postingId) handlers.openPosting?.(postingId)
      return
    }
    case A2UI_ACTION.openPlan:
      handlers.openPlan?.()
      return
    case A2UI_ACTION.change: {
      const optionId = text(context.optionId)
      if (optionId) handlers.change?.(optionId)
      return
    }
    case A2UI_ACTION.openReview:
    case A2UI_ACTION.share: {
      const documentId = text(context.documentId)
      if (!documentId) return
      if (action.name === A2UI_ACTION.share) handlers.share?.(documentId)
      else handlers.openReview?.(documentId)
      return
    }
    case A2UI_ACTION.resultAction: {
      const id = RESULT_IDS.find((item) => item === context.id)
      if (id) handlers.result?.[id]?.()
      return
    }
    default:
      return
  }
}
