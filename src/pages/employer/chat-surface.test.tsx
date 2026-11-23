// @vitest-environment happy-dom
import type { A2uiFrame } from '@push/api-client'
import approvalTool from '@push/api-client/a2ui-fixtures/v1.0/approval-tool.json'
import choiceSingle from '@push/api-client/a2ui-fixtures/v1.0/choice-single.json'
import choiceSingleAnswered from '@push/api-client/a2ui-fixtures/v1.0/choice-single-answered.json'
import planFeedback from '@push/api-client/a2ui-fixtures/v1.0/plan-feedback.json'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  applyTurnEvent,
  EMPTY_TURN,
  routeSurfaceAction,
  waitingSurface,
} from '../../features/employer-chat'
import { createSurfaceHost } from '../../shared/a2ui'
import { ChatActionsContext, type ChatActions } from './chat-actions'
import ChatTurnView from './chat-turn-view'

vi.spyOn(console, 'warn').mockImplementation(() => undefined)
;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

let root: Root | null = null
afterEach(() => {
  act(() => root?.unmount())
  root = null
  document.body.innerHTML = ''
})

// The golden frames share one surfaceId; in a thread every surface has its own.
const own = (fixture: unknown, surfaceId: string): A2uiFrame =>
  JSON.parse(
    JSON.stringify(fixture).replaceAll((fixture as A2uiFrame).surfaceId, surfaceId),
  ) as A2uiFrame

const turnOf = (...fixtures: A2uiFrame[]) => fixtures.reduce(applyTurnEvent, EMPTY_TURN)

const mount = async (busy: boolean, ...fixtures: A2uiFrame[]) => {
  const answer = vi.fn()
  const turn = turnOf(...fixtures)
  const waiting = waitingSurface(turn)?.surfaceId
  const host = createSurfaceHost((action) => routeSurfaceAction(action, { waiting, answer }))
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
  // happy-dom does not reflect the inert property; the attribute is what the browser reads.
  const inert = (id: string) => el.querySelector(`[data-surface="${id}"]`)?.hasAttribute('inert')
  const click = async (id: string, label: string) => {
    const button = [...el.querySelectorAll(`[data-surface="${id}"] button`)].find((item) => item.textContent?.includes(label))
    if (!button) throw new Error(`no ${label} in ${id}`)
    await act(async () => (button as HTMLElement).click())
  }
  return { el, answer, inert, click }
}

describe('Bot surfaces in a turn', () => {
  it('draws each surface; only the newest waiting one takes input', async () => {
    const view = await mount(
      false,
      own(choiceSingleAnswered, 's1'),
      own(planFeedback, 's2'),
      own(approvalTool, 's3'),
    )
    expect(view.inert('s1')).toBe(true)
    expect(view.inert('s2')).toBe(true)
    expect(view.inert('s3')).toBe(false)
    expect(view.el.textContent).toContain('지원 단계를 바꿔요')
  })

  it('answers only the newest waiting surface; an older open one sends nothing', async () => {
    const view = await mount(false, own(choiceSingle, 's1'), own(approvalTool, 's3'))
    expect(view.inert('s1')).toBe(true)
    await view.click('s1', '시작하기')
    expect(view.answer).not.toHaveBeenCalled()
    await view.click('s3', '실행')
    expect(view.answer.mock.calls).toEqual([['s3', { optionId: 'approve' }]])
  })

  it('takes no input while a run or an answer is in flight', async () => {
    const view = await mount(true, own(approvalTool, 's3'))
    expect(view.inert('s3')).toBe(true)
  })
})
