import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync(new URL('../../styles.css', import.meta.url), 'utf8')
const mobile = css.slice(css.lastIndexOf('@media (max-width:600px){', css.indexOf('.browser .job-grid{grid-template-columns:repeat(2')))

describe('home shortcuts on mobile', () => {
  it('keeps the three shortcut cards in one row', () => {
    expect(mobile).toContain('.browser .shortcuts{grid-template-columns:repeat(3,minmax(0,1fr))')
    expect(mobile).not.toContain('.browser .shortcuts>:first-child{grid-column:1/-1}')
  })
})
