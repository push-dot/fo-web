import type { ReactNode } from 'react'
import Icon from '../../../shared/ui/icon'
import { PLAN_CLOSE } from '../constants'

const DialogHead = ({
  title,
  subtitle,
  onClose,
}: {
  title: string
  subtitle?: ReactNode
  onClose: () => void
}) => (
  <div className="plan-dialog-head">
    <div>
      <h2 className="h2">{title}</h2>
      {subtitle ? <p className="b2 t3">{subtitle}</p> : null}
    </div>
    <button type="button" className="hbtn plan-close" aria-label={PLAN_CLOSE} onClick={onClose}>
      <Icon name="close" size={18} width={2.4} />
    </button>
  </div>
)

export default DialogHead
