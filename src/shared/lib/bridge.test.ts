import { describe, expect, it } from 'vitest'
import { themeOf, webViewFrom } from './bridge'

describe('themeOf', () => {
  it('applies the theme from __PUSH__', () => {
    expect(themeOf('dark')).toBe('dark')
  })

  it('updates on push:theme', () => {
    expect(themeOf('light')).toBe('light')
  })

  it('ignores unknown values', () => {
    expect(themeOf('system')).toBeUndefined()
    expect(themeOf(1)).toBeUndefined()
  })
})

describe('webViewFrom', () => {
  it('reads the list the app opened the page from', () => {
    expect(webViewFrom('?theme=light&from=following')).toBe('following')
    expect(webViewFrom('?from=bookmark')).toBe('bookmark')
  })

  it('ignores a missing or unknown from', () => {
    expect(webViewFrom('?theme=light')).toBeUndefined()
    expect(webViewFrom('?from=hub')).toBeUndefined()
  })
})
