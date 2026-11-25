import type { ComponentContext } from '@a2ui/web_core/v0_9'
import { createContext, type ReactNode } from 'react'

export type ViewProps<P> = {
  props: P
  context: ComponentContext
  buildChild: (id: string, basePath?: string) => ReactNode
}

export const dispatch = (context: ComponentContext, name: string, payload: object) =>
  void context.dispatchAction({ event: { name, context: payload } })

export const CheckMark = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
)

export const SurfaceAnswerable = createContext(true)
