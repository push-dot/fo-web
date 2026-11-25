import type { ChatUsage } from '../types'

const UsageMeter = ({ usage, className }: { usage: ChatUsage; className: string }) => (
  <span className={usage.full ? `${className} full` : className} aria-hidden="true">
    <i style={{ width: `${usage.percent}%` }} />
  </span>
)

export default UsageMeter
