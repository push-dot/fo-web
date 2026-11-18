// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { send } from './bridge'

describe('send external', () => {
  afterEach(() => vi.restoreAllMocks())

  it('opens an http(s) page in a new tab', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null)
    send({ type: 'external', url: 'https://careers.moapay.kr/jobs/1182' })
    expect(open).toHaveBeenCalledWith('https://careers.moapay.kr/jobs/1182', '_blank', 'noopener')
  })

  it.each(['javascript:alert(document.domain)', ' JavaScript:alert(1)', 'data:text/html,<script>alert(1)</script>', 'vbscript:x'])(
    'never opens %s, which would run in this origin',
    (url) => {
      const open = vi.spyOn(window, 'open').mockReturnValue(null)
      send({ type: 'external', url })
      expect(open).not.toHaveBeenCalled()
    },
  )
})
