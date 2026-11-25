// @vitest-environment happy-dom
import type { A2uiFrame } from '@push/api-client'
import approvalTool from '@push/api-client/a2ui-fixtures/v1.0/approval-tool.json'
import choiceSingle from '@push/api-client/a2ui-fixtures/v1.0/choice-single.json'
import choiceSingleAnswered from '@push/api-client/a2ui-fixtures/v1.0/choice-single-answered.json'
import fitLocked from '@push/api-client/a2ui-fixtures/v1.0/fit-locked.json'
import resultSaveFailed from '@push/api-client/a2ui-fixtures/v1.0/result-save-failed.json'
import planFeedback from '@push/api-client/a2ui-fixtures/v1.0/plan-feedback.json'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { applyTurnEvent, EMPTY_TURN, waitingSurface } from '../utils/chat-turn'
import { routeSurfaceAction } from '../utils/surface-action'
import { createSurfaceHost } from '../../../shared/a2ui'
import { ChatActionsContext } from '../hooks'
import type { ChatActions } from '../types'
import ChatTurnView from './chat-turn-view'

vi.spyOn(console, 'warn').mockImplementation(() => undefined)
;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

let root: Root | null = null
afterEach(() => {
  act(() => root?.unmount())
  root = null
  document.body.innerHTML = ''
})

const own = (fixture: unknown, surfaceId: string): A2uiFrame =>
  JSON.parse(
    JSON.stringify(fixture).replaceAll((fixture as A2uiFrame).surfaceId, surfaceId),
  ) as A2uiFrame

const turnOf = (...fixtures: A2uiFrame[]) => fixtures.reduce(applyTurnEvent, EMPTY_TURN)

const mount = async (busy: boolean, ...fixtures: A2uiFrame[]) => {
  const answer = vi.fn()
  const openPlan = vi.fn()
  const retry = vi.fn()
  const turn = turnOf(...fixtures)
  const waiting = waitingSurface(turn)?.surfaceId
  const host = createSurfaceHost((action) =>
    routeSurfaceAction(action, { waiting, answer, openPlan, result: { retry_save: retry } }),
  )
  const actions: ChatActions = {
    busy,
    surfaces: host,
    waiting,
    people: [],
    send: () => undefined,
    focus: () => undefined,
    redraft: () => undefined,
    copied: () => undefined,
  }
  const el = document.createElement('div')
  document.body.append(el)
  root = createRoot(el)
  await act(async () =>
    root?.render(
      <ChatActionsContext.Provider value={actions}>
        <ChatTurnView item={{ kind: 'turn', key: 't', live: false, turn }} />
      </ChatActionsContext.Provider>,
    ),
  )
  const button = (id: string, label: string) => {
    const found = [...el.querySelectorAll(`[data-surface="${id}"] button`)].find((item) =>
      item.textContent?.includes(label),
    )
    if (!found) throw new Error(`no ${label} in ${id}`)
    return found as HTMLButtonElement
  }
  const click = async (id: string, label: string) => {
    await act(async () => button(id, label).click())
    await act(async () => new Promise((resolve) => setTimeout(resolve, 0)))
  }
  const answers = (id: string) =>
    [...el.querySelectorAll(`[data-surface="${id}"] .a2-choice button`)] as HTMLButtonElement[]
  return { el, answer, openPlan, retry, button, click, answers }
}

describe('Bot surfaces in a turn', () => {
  it('draws each surface; no surface is inert, only the newest waiting choice can answer', async () => {
    const view = await mount(
      false,
      own(choiceSingleAnswered, 's1'),
      own(planFeedback, 's2'),
      own(approvalTool, 's3'),
    )
    expect(view.el.querySelector('[inert]')).toBeNull()
    expect(view.answers('s1').every((item) => item.disabled)).toBe(true)
    expect(view.answers('s3').some((item) => item.disabled)).toBe(false)
    expect(view.el.textContent).toContain('지원 단계를 바꿔요')
  })

  it('an older open choice is drawn answered with its controls disabled and sends nothing', async () => {
    const view = await mount(false, own(choiceSingle, 's1'), own(approvalTool, 's3'))
    expect(view.answers('s1').length).toBeGreaterThan(0)
    expect(view.answers('s1').every((item) => item.disabled)).toBe(true)
    expect(view.el.querySelector('[data-surface="s1"] .a2-choice.done')).not.toBeNull()
    await view.click('s1', '시작하기')
    expect(view.answer).not.toHaveBeenCalled()
    await view.click('s3', '실행')
    expect(view.answer.mock.calls).toEqual([['s3', { optionId: 'approve' }]])
  })

  it('buttons in a fit or document surface that is not waiting still run their local action', async () => {
    const view = await mount(
      false,
      own(fitLocked, 'f1'),
      own(resultSaveFailed, 'd1'),
      own(approvalTool, 's3'),
    )
    await view.click('f1', 'ULTRA로 업그레이드')
    expect(view.openPlan).toHaveBeenCalledTimes(1)
    const [retry] = [...view.el.querySelectorAll('[data-surface="d1"] .a2-bts button')]
    await act(async () => (retry as HTMLElement).click())
    await act(async () => new Promise((resolve) => setTimeout(resolve, 0)))
    expect(view.retry).toHaveBeenCalledTimes(1)
  })

  it('cannot answer while a run or an answer is in flight', async () => {
    const view = await mount(true, own(approvalTool, 's3'))
    expect(view.answers('s3').every((item) => item.disabled)).toBe(true)
  })
})
