import type { ReactNode } from 'react'
import Icon from './icon'
import type { IconName } from './icon-paths'

type StateBlockProps = {
  icon: IconName
  title: string
  description?: string
  action?: ReactNode
  boxed?: boolean
  error?: boolean
}

const StateBlock = ({ icon, title, description, action, boxed = false, error = false }: StateBlockProps) => (
  <div className={['state', boxed ? 'box' : '', error ? 'err' : ''].filter(Boolean).join(' ')} role={error ? 'alert' : undefined}>
    <span className="state-tile">
      <Icon name={icon} size={28} width={boxed && !error ? 1.8 : 2} />
    </span>
    <p className="b1 w7">{title}</p>
    {description ? <p className="b2 t3">{description}</p> : null}
    {action ? <div className="state-actions">{action}</div> : null}
  </div>
)

export default StateBlock
