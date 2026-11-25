import type { SVGProps } from 'react'
import { PATHS, type IconName } from './icon-paths'

type IconProps = { name: IconName; size?: number; width?: number; filled?: boolean } & Omit<SVGProps<SVGSVGElement>, 'name' | 'width'>

const Icon = ({ name, size = 20, width = 2, filled = false, ...rest }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth={width}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    style={{ flex: 'none' }}
    {...rest}
  >
    <path d={PATHS[name]} />
  </svg>
)

export default Icon
