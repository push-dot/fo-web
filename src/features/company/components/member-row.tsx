import { brandColor } from '@push/shared'
import { MEMBER_SELF, REMOVE_MEMBER, TRANSFER_ADMIN } from '../constants'
import { memberInitials } from '../../applications'
import Row from './row'

const MemberRow = ({
  name,
  email,
  roleLabel,
  admin,
  self,
  busy,
  onRemove,
  onTransfer,
}: {
  name: string
  email: string
  roleLabel: string
  admin: boolean
  self: boolean
  busy: boolean
  onRemove?: () => void
  onTransfer?: () => void
}) => (
  <Row
    avatar={
      <span className="av" style={{ background: brandColor(name) }}>
        {memberInitials(name)}
      </span>
    }
    title={<span className="b2 w7">{name}</span>}
    sub={email}
    badge={<span className={admin ? 'badge ac' : 'badge grey'}>{roleLabel}</span>}
  >
    {self ? <span className="c1 t3">{MEMBER_SELF}</span> : null}
    {onTransfer ? (
      <button type="button" className="btn sec sm" disabled={busy} onClick={onTransfer}>
        {TRANSFER_ADMIN}
      </button>
    ) : null}
    {onRemove ? (
      <button type="button" className="btn sec sm member-remove" disabled={busy} onClick={onRemove}>
        {REMOVE_MEMBER}
      </button>
    ) : null}
  </Row>
)

export default MemberRow
