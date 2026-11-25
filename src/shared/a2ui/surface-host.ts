import type { ReactCatalogComponent } from '@a2ui/react/v0_9'
import { MessageProcessor, type ActionListener, type Catalog, type SurfaceModel } from '@a2ui/web_core/v0_9'
import type { A2uiMessage } from '@push/api-client'
import { PUSH_CATALOG } from './catalog'
import { A2UI_PROTOCOL } from './protocol'

export type SurfaceAction = Parameters<ActionListener>[0]

export const createSurfaceHost = (
  onAction: (action: SurfaceAction) => void,
  catalog: Catalog<ReactCatalogComponent> = PUSH_CATALOG,
) => {
  const processor = new MessageProcessor<ReactCatalogComponent>([catalog], onAction, {
    version: A2UI_PROTOCOL.version,
    reportErrorsOnly: true,
    errorHandler: (error) => console.warn('a2ui', error),
  })
  const applied = new Map<string, string>()
  const listeners = new Set<() => void>()
  const notify = () => queueMicrotask(() => listeners.forEach((listener) => listener()))

  const get = (surfaceId: string): SurfaceModel<ReactCatalogComponent> | undefined =>
    processor.model.surfacesMap.get(surfaceId)

  return {
    get,
    upsert: (surfaceId: string, messages: readonly A2uiMessage[]) => {
      const key = JSON.stringify(messages)
      if (applied.get(surfaceId) === key) return false
      applied.set(surfaceId, key)
      const next = get(surfaceId)
        ? messages.filter((message) => !('createSurface' in message))
        : messages
      processor.processMessages(structuredClone(next) as never)
      notify()
      return true
    },
    patch: (surfaceId: string, values: Record<string, unknown>) => {
      const surface = get(surfaceId)
      if (!surface) return
      for (const [key, value] of Object.entries(values)) surface.dataModel.set(`/${key}`, value)
      notify()
    },
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
