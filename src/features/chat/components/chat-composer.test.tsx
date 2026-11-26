// @vitest-environment happy-dom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { ATTACH_LABEL } from '../constants'
import type { ChatPerson } from '../types'
import ChatComposer from './chat-composer'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

let root: Root | null = null
let host: HTMLElement | null = null
afterEach(() => {
  act(() => root?.unmount())
  host?.remove()
  root = null
  host = null
})

const person = (applicationId: string, name: string, postingId: string): ChatPerson => ({
  applicationId,
  name,
  postingId,
  postingTitle: `공고 ${postingId}`,
})

const pickMenu = async (people: ChatPerson[]) => {
  host = document.body.appendChild(document.createElement('div'))
  root = createRoot(host)
  await act(async () =>
    root?.render(
      <ChatComposer
        text=""
        sending={false}
        awaiting={false}
        applicationId=""
        people={people}
        file={null}
        pdfLocked={false}
        accessMode="AUTO"
        onAccessMode={() => undefined}
        onText={() => undefined}
        onApplication={() => undefined}
        onFile={() => undefined}
        onStop={() => undefined}
        onSubmit={() => undefined}
      />,
    ),
  )
  const chip = [...(host?.querySelectorAll('button') ?? [])].find((button) => button.textContent === ATTACH_LABEL)
  await act(async () => chip?.click())
  return host?.textContent ?? ''
}

describe('applicant menu', () => {
  it('names the posting under each applicant when the list spans several postings', async () => {
    const menu = await pickMenu([person('a1', '김태윤', 'p1'), person('a2', '이서진', 'p2')])
    expect(menu).toContain('김태윤')
    expect(menu).toContain('공고 p1')
    expect(menu).toContain('공고 p2')
  })

  it('shows names only when every applicant is on one posting', async () => {
    const menu = await pickMenu([person('a1', '김태윤', 'p1'), person('a2', '이서진', 'p1')])
    expect(menu).toContain('이서진')
    expect(menu).not.toContain('공고 p1')
  })
})
