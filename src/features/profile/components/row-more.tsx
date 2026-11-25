import { useState } from 'react'
import Icon from '../../../shared/ui/icon'
import Menu from '../../../shared/ui/menu'
import Popover from '../../../shared/ui/popover'
import type { MenuItem } from '../../../shared/ui/types'
import { MORE_LABEL } from '../constants'

const RowMore = ({ label, items }: { label: string; items: MenuItem[] }) => {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  return (
    <span className="row-more">
      <button
        type="button"
        className="hbtn"
        aria-label={`${label} ${MORE_LABEL}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon name="more" size={20} width={3} />
      </button>
      {open ? (
        <Popover label={label} onClose={close} className="row-pop">
          <Menu items={items} onClose={close} />
        </Popover>
      ) : null}
    </span>
  )
}

export default RowMore
