import { describe, expect, it } from 'vitest'

import styles from '../styles.css?raw'

const rule = (selector: string) =>
  styles.match(
    new RegExp(`(^|\\n)${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\{([^}]*)\\}`),
  )?.[2] ?? ''

describe('webview posting styles', () => {
  it('drops the unused unscoped .fit-score rule', () => {
    expect(styles).not.toMatch(/\.fit-score/)
  })

  it('keeps a single browser weight-800 rule', () => {
    expect(styles.match(/\.browser \.w8\{font-weight:800\}/g)).toEqual([
      '.browser .w8{font-weight:800}',
    ])
  })

  it('gives the posting company row 12px, the gap the WebView detail uses', () => {
    expect(rule('.company')).toContain('gap:12px')
  })

  it('keeps the board rhythm on WebView details: page gap 24, header gap 12, no tail under the last timeline row', () => {
    expect(rule('.page.wv')).toContain('gap:24px')
    expect(rule('.wv .head')).toContain('gap:12px')
    expect(rule('.wv .tl-row:last-child .tl-body')).toContain('padding-bottom:0')
  })

  it('leaves the browser page gap at 22 and the header gap at 10', () => {
    expect(rule('.page')).toContain('gap:22px')
    expect(rule('.head')).toContain('gap:10px')
  })
})
