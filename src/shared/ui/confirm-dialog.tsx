import type { ReactNode } from 'react'
import Dialog from './dialog'

type ConfirmProps = {
  title: string
  body?: ReactNode
  confirmLabel: string
  cancelLabel?: string
  danger?: boolean
  busy?: boolean
  onConfirm: () => void
  onClose: () => void
}

const ConfirmDialog = ({
  title,
  body,
  confirmLabel,
  cancelLabel = '취소',
  danger = false,
  busy = false,
  onConfirm,
  onClose,
}: ConfirmProps) => (
  <Dialog label={title} onClose={onClose} className="confirm">
    <div className="confirm-copy">
      <h2 className="h3">{title}</h2>
      {body ? <div className="b2 t3">{body}</div> : null}
    </div>
    <div className="sheet-actions">
      <button type="button" className="btn sec" onClick={onClose}>
        {cancelLabel}
      </button>
      <button
        type="button"
        className={danger ? 'btn danger' : 'btn pri'}
        disabled={busy}
        onClick={onConfirm}
      >
        {confirmLabel}
      </button>
    </div>
  </Dialog>
)

export default ConfirmDialog
