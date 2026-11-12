import { describe, expect, it } from 'vitest'
import styles from '../../styles.css?raw'

describe('legal table overflow', () => {
  it('keeps wide tables inside a horizontally scrollable wrapper', () => {
    expect(styles).toMatch(/\.biz-table-wrap\{[^}]*overflow-x:auto/)
    expect(styles).toMatch(/\.biz-table-wrap\{[^}]*min-width:0/)
    expect(styles).toMatch(/\.legal-body\{[^}]*overflow-wrap:anywhere/)
  })
})
