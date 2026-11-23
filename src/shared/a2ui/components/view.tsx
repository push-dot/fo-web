import type { ComponentContext } from '@a2ui/web_core/v0_9'
import { createContext, type ReactNode } from 'react'

/** What a Push component view gets: its resolved props (bindings already read), the context and the child builder. */
export type ViewProps<P> = {
  props: P
  context: ComponentContext
  buildChild: (id: string, basePath?: string) => ReactNode
}

/** Dispatches a named action of this component; the surface host routes it (answer → server, the rest → the app). */
export const dispatch = (context: ComponentContext, name: string, payload: object) =>
  void context.dispatchAction({ event: { name, context: payload } })

export const CheckMark = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
)

/** Whether this surface is the one that may answer now: an older or busy one still draws, but its answer controls are disabled. */
export const SurfaceAnswerable = createContext(true)
