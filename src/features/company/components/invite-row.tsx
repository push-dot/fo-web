import { useState } from 'react'
import Icon from '../../../shared/ui/icon'
import Menu from '../../../shared/ui/menu'
import Popover from '../../../shared/ui/popover'
import type { MenuItem } from '../../../shared/ui/types'
import {
  INVITE_PENDING,
  INVITE_PENDING_TITLE,
  INVITE_RESEND,
  INVITE_REVOKE,
  MEMBER_MORE,
} from '../constants'
import Row from './row'

const More = ({ items }: { items: MenuItem[] }) => {
  const [open, setOpen] = useState(false)
  return (
    <span className="member-more">
      <button
        type="button"
        className="hbtn"
        aria-label={MEMBER_MORE}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon name="more" size={20} width={2.6} />
      </button>
      {open ? (
        <Popover label={MEMBER_MORE} onClose={() => setOpen(false)} className="member-pop">
          <Menu items={items} onClose={() => setOpen(false)} />
        </Popover>
      ) : null}
    </span>
  )
}

const InviteRow = ({
  expiry,
  busy,
  onResend,
  onRevoke,
}: {
  expiry: string
  busy: boolean
  onResend?: () => void
  onRevoke?: () => void
}) => (
  <Row
    avatar={
      <span className="av member-pending">
        <Icon name="mail" size={20} />
      </span>
    }
    title={<span className="b1 w7">{INVITE_PENDING_TITLE}</span>}
    sub={expiry}
    badge={<span className="badge orange">{INVITE_PENDING}</span>}
  >
    {onResend ? (
      <button type="button" className="btn sec sm" disabled={busy} onClick={onResend}>
        {INVITE_RESEND}
      </button>
    ) : null}
    {onRevoke ? (
      <More items={[{ label: INVITE_REVOKE, icon: 'close', danger: true, onSelect: onRevoke }]} />
    ) : null}
  </Row>
)

export default InviteRow
