import { useState } from 'react'
import Icon from '../../../shared/ui/icon'
import Popover from '../../../shared/ui/popover'
import { NOTIFICATION_TITLE } from '../constants'
import NotificationPanel from './notification-panel'

const NotificationBell = ({ unread }: { unread: number }) => {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  return (
    <div className="acct">
      <button
        type="button"
        className="hbtn"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={unread > 0 ? `${NOTIFICATION_TITLE} ${unread}개` : NOTIFICATION_TITLE}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon name="bell" size={22} />
        {unread > 0 ? <span className="nb">{unread}</span> : null}
      </button>
      {open ? (
        <Popover label={NOTIFICATION_TITLE} onClose={close} className="notif-pop">
          <NotificationPanel onClose={close} />
        </Popover>
      ) : null}
    </div>
  )
}

export default NotificationBell
