import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { NARROW, useMedia } from '../lib/use-media'
import { useEscape } from './dialog'
import { rememberOpener, returnFocus, trapTab } from './focus'

const GAP = 8

const TAB_BAR = 64

const TAB_BAR_MAX = 1024

export const opensUp = (pop: { top: number; bottom: number }, host: { top: number }, viewport: number, windowWidth = Number.POSITIVE_INFINITY) => {
  const reserved = windowWidth <= TAB_BAR_MAX ? TAB_BAR : 0
  return pop.bottom > viewport - reserved - GAP && host.top - (pop.bottom - pop.top) - GAP >= 0
}

type PopoverProps = { label: string; onClose: () => void; className?: string; style?: CSSProperties; children: ReactNode }

const Popover = ({ label, onClose, className, style, children }: PopoverProps) => {
  const narrow = useMedia(NARROW)
  const tabbed = useMedia('(max-width: 1024px)')
  const ref = useRef<HTMLDivElement>(null)
  const [opener] = useState(() => (document.activeElement instanceof HTMLElement ? document.activeElement : null))
  const [up, setUp] = useState(false)
  useEscape(onClose)
  useLayoutEffect(() => {
    const pop = ref.current
    if (pop && opener) rememberOpener(pop, opener)
    return () => returnFocus(opener, pop)
  }, [narrow, opener])
  useLayoutEffect(() => {
    const host = ref.current?.parentElement
    if (narrow || !ref.current || !host) return
    setUp(opensUp(ref.current.getBoundingClientRect(), host.getBoundingClientRect(), window.innerHeight, window.innerWidth))
  }, [narrow, tabbed])
  useEffect(() => {
    if (narrow) return
    const onDown = (event: PointerEvent) => {
      const host = ref.current?.parentElement
      if (host && !host.contains(event.target as Node)) onClose()
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [narrow, onClose])
  if (narrow) {
    return createPortal(
      <div className="msheet-scrim" role="presentation" onClick={onClose}>
        <div
          ref={ref}
          className={['msheet', className ?? ''].filter(Boolean).join(' ')}
          role="dialog"
          aria-modal="true"
          aria-label={label}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => ref.current && trapTab(ref.current, event)}
        >
          {children}
        </div>
      </div>,
      document.querySelector('.browser') ?? document.body,
    )
  }
  return (
    <div ref={ref} className={['pop', up ? 'pop-up' : '', className ?? ''].filter(Boolean).join(' ')} role="dialog" aria-label={label} style={style}>
      {children}
    </div>
  )
}

export default Popover
