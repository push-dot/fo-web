import { describe, expect, it, vi } from 'vitest'
import { nativeDetailFor, onNativeDetail, setNativeDetail, themeOf, webViewFrom } from './bridge'

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

describe('native detail', () => {
  it('keeps a valid push:detail for its path and tells listeners', () => {
    const listener = vi.fn()
    const off = onNativeDetail(listener)
    setNativeDetail({ path: '/postings/p1', data: { id: 'p1' }, updatedAt: 5 })
    off()
    expect(listener).toHaveBeenCalledWith({ path: '/postings/p1', data: { id: 'p1' }, updatedAt: 5 })
    expect(nativeDetailFor('/postings/p1')?.data).toEqual({ id: 'p1' })
    expect(nativeDetailFor('/postings/p2')).toBeUndefined()
  })

  it('ignores a malformed push:detail', () => {
    setNativeDetail({ path: '/profiles/u1', data: null, updatedAt: 1 })
    setNativeDetail({ path: '/profiles/u1', data: {} })
    setNativeDetail('x')
    expect(nativeDetailFor('/profiles/u1')).toBeUndefined()
  })
})
