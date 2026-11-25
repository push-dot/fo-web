import type { ReactNode } from 'react'

const Row = ({
  avatar,
  title,
  sub,
  badge,
  children,
}: {
  avatar: ReactNode
  title: ReactNode
  sub: string
  badge: ReactNode
  children?: ReactNode
}) => (
  <li className="member-row">
    {avatar}
    <span className="member-copy">
      {title}
      <span className="c1 t3">{sub}</span>
    </span>
    {badge}
    <span className="member-end">{children}</span>
  </li>
)

export default Row
