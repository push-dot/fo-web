import Dialog from '../../../shared/ui/dialog'
import {
  PLAN_UNSUBSCRIBE_CONFIRM,
  PLAN_UNSUBSCRIBE_KEEP,
  PLAN_UNSUBSCRIBE_TITLE,
  planUnsubscribeBody,
} from '../constants'
import DialogHead from './dialog-head'

const CancelDialog = ({
  endsOn,
  pending,
  error,
  onConfirm,
  onClose,
}: {
  endsOn: string | null
  pending: boolean
  error: string | null
  onConfirm: () => void
  onClose: () => void
}) => (
  <Dialog label={PLAN_UNSUBSCRIBE_TITLE} onClose={onClose} className="plan-dialog">
    <DialogHead
      title={PLAN_UNSUBSCRIBE_TITLE}
      subtitle={planUnsubscribeBody(endsOn)}
      onClose={onClose}
    />
    {error ? (
      <p className="auth-error" role="alert">
        {error}
      </p>
    ) : null}
    <div className="sheet-actions">
      <button type="button" className="btn sec" onClick={onClose}>
        {PLAN_UNSUBSCRIBE_KEEP}
      </button>
      <button type="button" className="btn pri" disabled={pending} onClick={onConfirm}>
        {PLAN_UNSUBSCRIBE_CONFIRM}
      </button>
    </div>
  </Dialog>
)

export default CancelDialog
