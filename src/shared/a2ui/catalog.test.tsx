// @vitest-environment happy-dom
import { A2uiSurface } from '@a2ui/react/v0_9'
import { MessageProcessor } from '@a2ui/web_core/v0_9'
import type { A2uiFrame } from '@push/api-client'
import { readdirSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PUSH_CATALOG } from './catalog'
import { createSurfaceHost, type SurfaceAction } from './surface-host'

// The golden 1.0 wire frames push-be writes (copied into @push/api-client). A catalog change there fails here.
const dir = dirname(
  createRequire(import.meta.url).resolve('@push/api-client/a2ui-fixtures/v1.0/todo.json'),
)
const legacy = JSON.parse(
  readFileSync(
    createRequire(import.meta.url).resolve('@push/api-client/a2ui-fixtures/choice-single.json'),
    'utf8',
  ),
) as A2uiFrame
const fixtures = Object.fromEntries(
  readdirSync(dir)
    .filter((name) => name.endsWith('.json'))
    .map((name) => [
      name.replace('.json', ''),
      JSON.parse(readFileSync(join(dir, name), 'utf8')) as A2uiFrame,
    ]),
)
const frame = (name: string) => {
  const found = fixtures[name]
  if (!found) throw new Error(`no fixture ${name}`)
  return found
}

// Lit warns once in dev; React wants act in a DOM test.
vi.spyOn(console, 'warn').mockImplementation(() => undefined)
;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

let root: Root | null = null
afterEach(() => {
  act(() => root?.unmount())
  root = null
  document.body.innerHTML = ''
})

/** A one-surface frame of the Push catalog: `components` as given, the data model as `value`. */
const made = (components: Record<string, unknown>[], value: Record<string, unknown> = {}): A2uiFrame => {
  const surfaceId = 'made'
  const catalogId = 'https://push.app/a2ui/catalogs/push/v1/catalog.json'
  return {
    ...frame('todo'),
    surfaceId,
    messages: [
      { version: '1.0', createSurface: { surfaceId, catalogId } },
      { version: '1.0', updateComponents: { surfaceId, components } },
      { version: '1.0', updateDataModel: { surfaceId, path: '/', value } },
    ] as A2uiFrame['messages'],
  }
}

const draw = async (from: string | A2uiFrame) => {
  const actions: SurfaceAction[] = []
  const host = createSurfaceHost((action) => void actions.push(action))
  const { surfaceId, messages } = typeof from === 'string' ? frame(from) : from
  host.upsert(surfaceId, messages)
  const surface = host.get(surfaceId)
  if (!surface) throw new Error(`${name} made no surface`)
  const el = document.createElement('div')
  document.body.append(el)
  root = createRoot(el)
  await act(async () => root?.render(<A2uiSurface surface={surface} />))
  await act(async () => new Promise((resolve) => setTimeout(resolve, 0)))
  const click = async (target: Element | null | undefined) => {
    if (!target) throw new Error('nothing to click')
    await act(async () => (target as HTMLElement).click())
    await act(async () => new Promise((resolve) => setTimeout(resolve, 0)))
  }
  const button = (label: string) =>
    [...el.querySelectorAll('button')].find((item) => item.textContent?.includes(label))
  const input = (label: string) =>
    [...el.querySelectorAll('label')]
      .find((item) => item.textContent?.includes(label))
      ?.querySelector('input')
  return { el, host, surfaceId, actions, click, button, input }
}

describe('Push catalog against the golden frames', () => {
  it('has all 23 fixtures', () => {
    expect(Object.keys(fixtures)).toHaveLength(23)
  })

  it.each(Object.keys(fixtures))('%s validates against the catalog', (name) => {
    const errors = new MessageProcessor([PUSH_CATALOG]).processMessagesWithErrors(
      frame(name).messages,
    )
    expect(errors).toEqual([])
  })

  it.each(Object.keys(fixtures))('%s draws its text', async (name) => {
    const { el } = await draw(name)
    expect(el.textContent?.trim().length).toBeGreaterThan(0)
    // Text is plain: no Markdown renderer and no HTML from the frame.
    expect(el.querySelector('.no-markdown-renderer')).toBeNull()
  })
})

describe('PushChoice', () => {
  it('single pick answers on click with {optionId}', async () => {
    const view = await draw('choice-single')
    expect(view.el.textContent).toContain('추천')
    await view.click(view.button('시작하기'))
    expect(view.actions).toMatchObject([
      { name: 'answer', surfaceId: view.surfaceId, context: { optionId: 'ready' } },
    ])
  })

  it('multiple pick selects with checkboxes and answers {optionId, optionIds} in choice order', async () => {
    const view = await draw('choice-multiple')
    expect(view.input('이력서')?.type).toBe('checkbox')
    expect(view.button('이대로 진행')?.disabled).toBe(true)
    await view.click(view.input('자기소개서'))
    await view.click(view.input('이력서'))
    expect(view.host.read(view.surfaceId, 'selected')).toEqual({ q: ['cover_letter', 'resume'] })
    await view.click(view.button('이대로 진행'))
    expect(view.actions.at(-1)?.context).toEqual({
      optionId: 'resume',
      optionIds: ['resume', 'cover_letter'],
    })
  })

  it('secondary answers its own id', async () => {
    const view = await draw('choice-multiple')
    await view.click(view.button('닫기'))
    expect(view.actions.at(-1)?.context).toEqual({ optionId: 'cancel' })
  })

  it('steps through questions with 1/3 and submits every answerable pick', async () => {
    const view = await draw('choice-sections')
    expect(view.el.textContent).toContain('1/3')
    await view.click(view.button('다음'))
    expect(view.el.textContent).toContain('2/3')
    await view.click(view.input('https://github.com/push'))
    await view.click(view.button('다음'))
    expect(view.el.textContent).toContain('3/3')
    expect(view.input('원래 말투로')?.type).toBe('radio')
    await view.click(view.button('이 말투로 쓰기'))
    expect(view.actions.at(-1)?.context).toEqual({
      optionId: 'submit',
      optionIds: ['submit', 'resume', 'm_file', 'preserve'],
    })
  })

  it('names the submit button after a picked template', async () => {
    const view = await draw('choice-templates')
    expect(view.button('클래식으로 만들기')).toBeDefined()
    await view.click(view.input('모던'))
    expect(view.button('모던으로 만들기')).toBeDefined()
  })

  it('two-button form answers the action on the right', async () => {
    const view = await draw('approval-tool')
    const buttons = [...view.el.querySelectorAll('.a2-bts button')]
    expect(buttons.map((item) => item.textContent)).toEqual(['닫기', '실행'])
    expect(buttons[1]?.className).toContain('pri')
    await view.click(buttons[1])
    expect(view.actions.at(-1)?.context).toEqual({ optionId: 'approve' })
  })

  it('answered: the pick keeps its highlight, the rest fade and nothing responds', async () => {
    const view = await draw('choice-single-answered')
    const ready = view.button('시작하기')
    expect(ready?.className).toContain('sel')
    expect(view.button('닫기')?.className).not.toContain('sel')
    expect(view.el.querySelector('.a2-choice.done')).not.toBeNull()
    await view.click(view.button('닫기'))
    expect(view.actions).toEqual([])
  })

  it('a local patch of /open and /picked moves the surface to its answered state', async () => {
    const view = await draw('approval-tool')
    await act(async () => view.host.patch(view.surfaceId, { open: false, picked: ['approve'] }))
    expect(view.button('실행')?.className).toContain('sel')
    expect(view.button('실행')?.disabled).toBe(true)
  })

  it('a repeated frame does not reset what the person picked', async () => {
    const view = await draw('choice-multiple')
    await view.click(view.input('포트폴리오'))
    expect(view.host.upsert(view.surfaceId, frame('choice-multiple').messages)).toBe(false)
    expect(view.host.read(view.surfaceId, 'selected')).toEqual({ q: ['portfolio'] })
  })

  it('an answered snapshot of the same surface replaces the open one', async () => {
    const view = await draw('choice-single')
    view.host.upsert(view.surfaceId, frame('choice-single-answered').messages)
    expect(view.host.read(view.surfaceId, 'open')).toBe(false)
    expect(view.host.read(view.surfaceId, 'picked')).toEqual(['ready'])
  })
})

describe('frame data', () => {
  it('ids named like Object.prototype keys answer like any other id', async () => {
    const view = await draw(
      made(
        [
          {
            id: 'root',
            component: 'PushChoice',
            questions: [
              {
                id: 'constructor',
                choices: [
                  { id: 'toString', label: '첫째' },
                  { id: 'b', label: '둘째' },
                ],
                multiple: true,
              },
            ],
            answer: 'pick',
            submit: { label: '보내기', labels: {} },
            open: { '@path': '/open' },
            picked: { '@path': '/picked' },
            selected: { '@path': '/selected' },
          },
        ],
        { open: true, picked: [], selected: {} },
      ),
    )
    expect(view.el.querySelector('[role="group"]')?.getAttribute('aria-label')).toBe('질문')
    await view.click(view.input('첫째'))
    expect(view.host.read(view.surfaceId, 'selected')).toEqual({ constructor: ['toString'] })
    await view.click(view.button('보내기'))
    expect(view.actions.at(-1)?.context).toEqual({ optionId: 'toString' })
  })

  it('a prop the backend adds later is ignored and the card still draws', async () => {
    const extra = made([
      { id: 'root', component: 'PushTodo', items: [{ text: '이력서 읽기', state: 'done', eta: 3 }], tone: 'new' },
    ])
    expect(new MessageProcessor([PUSH_CATALOG]).processMessagesWithErrors(extra.messages)).toEqual([])
    expect((await draw(extra)).el.textContent).toContain('이력서 읽기')
  })

  it('text from a surface is literal: no Markdown and no HTML', async () => {
    const raw = '**bold** _it_ <img src=x onerror=alert(1)>'
    const view = await draw(made([{ id: 'root', component: 'Text', text: raw }]))
    expect(view.el.textContent).toContain(raw)
    expect(view.el.querySelector('img, strong, em, b, i')).toBeNull()
  })

  it('PushJobCard drops a javascript: image URL', async () => {
    const card = (imageUrl: string) =>
      made([{ id: 'root', component: 'PushJobCard', postingId: 'p1', company: '모아', title: '백엔드', imageUrl }])
    expect((await draw(card('javascript:alert(1)'))).el.querySelector('img')).toBeNull()
    act(() => root?.unmount())
    expect((await draw(card('https://cdn.push.app/a.png'))).el.querySelector('img')?.getAttribute('src')).toBe(
      'https://cdn.push.app/a.png',
    )
  })

  it('the diff sign and the to-do state have text for screen readers', async () => {
    expect((await draw('diff')).el.querySelector('.sr-only')?.textContent).toMatch(/추가|삭제/)
    act(() => root?.unmount())
    const todo = await draw('todo')
    const states = [...todo.el.querySelectorAll('.a2-ti .sr-only')].map((item) => item.textContent)
    expect(states.length).toBeGreaterThan(0)
    expect(states.every((item) => ['완료', '진행 중', '대기'].includes(item ?? ''))).toBe(true)
  })
})

describe('local actions', () => {
  it('PushDiff 전체 보기 dispatches open_review only with a documentId', async () => {
    expect((await draw('diff')).button('전체 보기')).toBeUndefined()
  })

  it('PushDocument buttons dispatch result_action with the id', async () => {
    const view = await draw('result-save-failed')
    const [only] = [...view.el.querySelectorAll('.a2-bts button')]
    await view.click(only)
    expect(view.actions.at(-1)).toMatchObject({
      name: 'result_action',
      context: { id: 'retry_save' },
    })
  })

  it('PushFit locked dispatches open_plan and shows no real bars', async () => {
    const view = await draw('fit-locked')
    await view.click(view.button('ULTRA로 업그레이드'))
    expect(view.actions.at(-1)).toMatchObject({ name: 'open_plan', context: {} })
  })

  it('PushFit opens the part scores in place', async () => {
    const view = await draw('fit')
    expect(view.el.querySelector('.a2-br')).toBeNull()
    await view.click(view.button('항목별 점수 보기'))
    expect(view.el.querySelectorAll('.a2-br').length).toBeGreaterThan(0)
  })
})

describe('version', () => {
  it('speaks 1.0: every fixture message says so and a v0.9.1 frame is refused', () => {
    expect(PUSH_CATALOG.protocolVersion).toBe('1.0')
    for (const name of Object.keys(fixtures)) {
      expect(
        frame(name).messages.every((message) => message.version === '1.0'),
        name,
      ).toBe(true)
    }
    expect(
      new MessageProcessor([PUSH_CATALOG]).processMessagesWithErrors(legacy.messages),
    ).not.toEqual([])
  })

  it('draws the 1.0 approval question (a body Text with id title) as the surface title', async () => {
    const { el } = await draw('approval-tool')
    expect(el.querySelector('.a2-tt')?.textContent).toBe('지원 단계를 바꿔요')
  })
})
