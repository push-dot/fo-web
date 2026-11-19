// @vitest-environment happy-dom
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it, vi } from 'vitest'
import { ErrorScreen } from './route-error'

describe('ErrorScreen', () => {
  it('retry button runs onRetry', () => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    const onRetry = vi.fn()
    const host = document.createElement('div')
    const root = createRoot(host)
    act(() => root.render(<ErrorScreen onRetry={onRetry} />))
    const buttons = host.querySelectorAll('button')
    expect(buttons).toHaveLength(1)
    act(() => buttons[0]?.click())
    expect(onRetry).toHaveBeenCalledOnce()
    act(() => root.unmount())
  })
})
