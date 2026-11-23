import type { ReactCatalogComponent } from '@a2ui/react/v0_9'
import {
  MessageProcessor,
  type ActionListener,
  type Catalog,
  type SurfaceModel,
} from '@a2ui/web_core/v0_9'
import type { A2uiMessage } from '@push/api-client'
import { PUSH_CATALOG } from './catalog'
import { A2UI_PROTOCOL } from './protocol'

export type SurfaceAction = Parameters<ActionListener>[0]

/**
 * Every Bot surface of one chat screen, kept by surfaceId in one official MessageProcessor.
 * A frame is a full snapshot: the first one creates the surface, later ones drop createSurface and update it.
 */
export const createSurfaceHost = (
  onAction: (action: SurfaceAction) => void,
  catalog: Catalog<ReactCatalogComponent> = PUSH_CATALOG,
) => {
  const processor = new MessageProcessor<ReactCatalogComponent>([catalog], onAction, {
    version: A2UI_PROTOCOL.version,
    // A frame this renderer cannot draw leaves that surface out; the rest of the thread still draws.
    reportErrorsOnly: true,
    errorHandler: (error) => console.warn('a2ui', error),
  })
  // The snapshot last applied to each surface: the same frame read again (a refetch) must not reset /selected.
  const applied = new Map<string, string>()
  const listeners = new Set<() => void>()
  // After the current render: a surface is created while the thread renders, and listeners set React state.
  const notify = () => queueMicrotask(() => listeners.forEach((listener) => listener()))

  const get = (surfaceId: string): SurfaceModel<ReactCatalogComponent> | undefined =>
    processor.model.surfacesMap.get(surfaceId)

  return {
    get,
    /** Applies a frame's messages. Returns whether anything changed. */
    upsert: (surfaceId: string, messages: readonly A2uiMessage[]) => {
      const key = JSON.stringify(messages)
      if (applied.get(surfaceId) === key) return false
      applied.set(surfaceId, key)
      const next = get(surfaceId)
        ? messages.filter((message) => !('createSurface' in message))
        : messages
      // The data model keeps the value it is given and writes picks into it: hand it a copy, not the frame.
      processor.processMessages(structuredClone(next) as never)
      notify()
      return true
    },
    /** Writes into one surface's own data model, e.g. the answer the app just sent. */
    patch: (surfaceId: string, values: Record<string, unknown>) => {
      const surface = get(surfaceId)
      if (!surface) return
      for (const [key, value] of Object.entries(values)) surface.dataModel.set(`/${key}`, value)
      notify()
    },
    /** A value of a surface's data model, e.g. `open`. */
    read: (surfaceId: string, key: string): unknown => {
      const surface = get(surfaceId)
      return surface?.dataModel.hasPath(`/${key}`) ? surface.dataModel.get(`/${key}`) : undefined
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      return () => void listeners.delete(listener)
    },
    dispose: () => processor.dispose(),
  }
}

export type SurfaceHost = ReturnType<typeof createSurfaceHost>
