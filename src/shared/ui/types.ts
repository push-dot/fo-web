import type { IconName } from './icon-paths'

export type MenuItem =
  | { divider: true }
  | {
      label: string
      icon?: IconName
      to?: string
      onSelect?: () => void
      danger?: boolean
      divider?: false
    }

export type ToastTone = 'ok' | 'err'

export type ToastAction = { label: string; onClick: () => void }
