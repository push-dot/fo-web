import type { A2uiResultActionId } from '@push/api-client'
import { describe, expect, it, vi } from 'vitest'
import type { SurfaceAction } from '../../shared/a2ui'
import { routeSurfaceAction, type SurfaceHandlers } from './surface-action'

const action = (name: string, context: Record<string, unknown>, surfaceId = 's1'): SurfaceAction =>
  ({ name, context, surfaceId, sourceComponentId: 'c', timestamp: '' }) as SurfaceAction

const RESULT_IDS: A2uiResultActionId[] = ['apply', 'convert', 'view', 'retry_save']

const handlersOf = () => ({
  waiting: 's1',
  answer: vi.fn(),
  openPosting: vi.fn(),
  openPlan: vi.fn(),
  change: vi.fn(),
  openReview: vi.fn(),
  share: vi.fn(),
  result: { apply: vi.fn(), convert: vi.fn(), view: vi.fn(), retry_save: vi.fn() },
})

describe('routeSurfaceAction', () => {
  it('sends answer with the PushChoice body to the approvals route', () => {
    const handlers = handlersOf()
    routeSurfaceAction(action('answer', { optionId: 'submit', optionIds: ['submit', 'resume'] }), handlers)
    routeSurfaceAction(action('answer', { optionId: 'ready' }), handlers)
    expect(handlers.answer.mock.calls).toEqual([
      ['s1', { optionId: 'submit', optionIds: ['submit', 'resume'] }],
      ['s1', { optionId: 'ready' }],
    ])
  })

  it('drops an answer from any surface but the newest waiting one', () => {
    const handlers = handlersOf()
    routeSurfaceAction(action('answer', { optionId: 'approve' }, 's0'), handlers)
    routeSurfaceAction(action('answer', { optionId: 'approve' }, 's0'), { ...handlers, waiting: undefined })
    expect(handlers.answer).not.toHaveBeenCalled()
    routeSurfaceAction(action('answer', { optionId: 'approve' }, 's1'), handlers)
    expect(handlers.answer).toHaveBeenCalledOnce()
  })

  it('runs each of the four allowlisted result actions and nothing else', () => {
    const handlers = handlersOf()
    const other = vi.fn()
    const result = { ...handlers.result, delete_all: other } as SurfaceHandlers['result']
    for (const id of RESULT_IDS) routeSurfaceAction(action('result_action', { id }), { ...handlers, result })
    for (const id of ['delete_all', 'toString', 'constructor'])
      routeSurfaceAction(action('result_action', { id, method: 'DELETE', path: '/api/v1/me' }), { ...handlers, result })
    for (const id of RESULT_IDS) expect(handlers.result[id]).toHaveBeenCalledOnce()
    expect(other).not.toHaveBeenCalled()
  })

  it('runs every local action in the app and never the approvals route', () => {
    const handlers = handlersOf()
    routeSurfaceAction(action('open_posting', { postingId: 'p1' }), handlers)
    routeSurfaceAction(action('open_plan', {}), handlers)
    routeSurfaceAction(action('change', { optionId: 'm_file' }), handlers)
    routeSurfaceAction(action('open_review', { documentId: 'd1' }), handlers)
    routeSurfaceAction(action('share', { documentId: 'd2' }), handlers)
    routeSurfaceAction(action('result_action', { id: 'view' }), handlers)
    routeSurfaceAction(action('submit_form', { anything: 1 }), handlers)
    expect(handlers.openPosting).toHaveBeenCalledWith('p1')
    expect(handlers.openPlan).toHaveBeenCalledOnce()
    expect(handlers.change).toHaveBeenCalledWith('m_file')
    expect(handlers.openReview).toHaveBeenCalledWith('d1')
    expect(handlers.share).toHaveBeenCalledWith('d2')
    expect(handlers.result.view).toHaveBeenCalledOnce()
    expect(handlers.answer).not.toHaveBeenCalled()
  })
})
