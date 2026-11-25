import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { openerOf, returnFocus, trapTab } from './focus'

type DialogProps = { label: string; onClose: () => void; wide?: boolean; className?: string; children: ReactNode }

export const useEscape = (onClose: () => void) => {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
}

const Dialog = ({ label, onClose, wide = false, className, children }: DialogProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const [opener] = useState(() => openerOf(document.activeElement))
  useEscape(onClose)
  useEffect(() => {
    if (!ref.current?.contains(document.activeElement)) ref.current?.focus()
  }, [])
  useLayoutEffect(() => {
    const dialog = ref.current
    return () => returnFocus(opener, dialog)
  }, [opener])
  return (
    <div className="sheet-scrim" role="presentation" onClick={onClose}>
      <div
        ref={ref}
        tabIndex={-1}
        className={['sheet', wide ? 'wide' : '', className ?? ''].filter(Boolean).join(' ')}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => ref.current && trapTab(ref.current, event)}
      >
        {children}
      </div>
    </div>
  )
}

export default Dialog
