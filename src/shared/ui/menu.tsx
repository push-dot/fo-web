import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { menuStep } from './focus'
import Icon from './icon'
import type { MenuItem } from './types'

const menuItems = (menu: HTMLElement) => [
  ...menu.querySelectorAll<HTMLElement>('[role="menuitem"]'),
]

const Menu = ({ items, onClose }: { items: MenuItem[]; onClose: () => void }) => {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (ref.current) menuItems(ref.current)[0]?.focus()
  }, [])
  const move = (key: string) => {
    const list = ref.current ? menuItems(ref.current) : []
    const next = menuStep(list.length, list.indexOf(document.activeElement as HTMLElement), key)
    if (next === null) return false
    list[next]?.focus()
    return true
  }
  return (
    <div
      ref={ref}
      className="menu"
      role="menu"
      onKeyDown={(event) => move(event.key) && event.preventDefault()}
    >
      {items.map((item, index) => {
        if (item.divider) return <div key={`hr${index}`} className="hr" role="separator" />
        const body = (
          <>
            {item.icon ? <Icon name={item.icon} size={20} /> : null}
            <span className="w6">{item.label}</span>
          </>
        )
        const className = item.danger ? 'mi red' : 'mi'
        return item.to ? (
          <Link
            key={item.label}
            to={item.to}
            role="menuitem"
            className={className}
            onClick={onClose}
          >
            {body}
          </Link>
        ) : (
          <button
            key={item.label}
            type="button"
            role="menuitem"
            className={className}
            onClick={() => {
              item.onSelect?.()
              onClose()
            }}
          >
            {body}
          </button>
        )
      })}
    </div>
  )
}

export default Menu
