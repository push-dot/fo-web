import type { A2uiAnswerContext, A2uiResultActionId } from '@push/api-client'
// The constants segment alone: the shared/a2ui index loads the renderer, which needs a DOM.
import { A2UI_ACTION } from '../../shared/a2ui/constants'
import type { SurfaceAction } from '../../shared/a2ui'

/** What the employer chat does for a surface action. A handler left out means web has no such path: ignored. */
export type SurfaceHandlers = {
  /** The newest waiting surface: an answer from any other surface is dropped. */
  waiting: string | undefined
  answer: (surfaceId: string, body: A2uiAnswerContext) => void
  openPosting?: (postingId: string) => void
  openPlan?: () => void
  change?: (optionId: string) => void
  openReview?: (documentId: string) => void
  share?: (documentId: string) => void
  result?: Partial<Record<A2uiResultActionId, () => void>>
}

// The only result_action ids the app runs; a method or path inside a surface is never called.
const RESULT_IDS: readonly A2uiResultActionId[] = ['apply', 'convert', 'view', 'retry_save']

const text = (value: unknown) => (typeof value === 'string' && value ? value : undefined)

/** Sends `answer` to the approvals route and runs the local actions in the app. Unknown names are ignored. */
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
