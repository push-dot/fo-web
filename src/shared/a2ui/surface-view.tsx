import { A2uiSurface } from '@a2ui/react/v0_9'
import type { A2uiMessage } from '@push/api-client'
import { useLayoutEffect } from 'react'
import './a2ui.css'
import type { SurfaceHost } from './surface-host'

type SurfaceViewProps = {
  host: SurfaceHost
  surfaceId: string
  messages: readonly A2uiMessage[]
  /** Not the newest waiting surface: drawn, but takes no input and no focus. */
  inert: boolean
}

/** One Bot surface in the thread, drawn by the official renderer. */
const SurfaceView = ({ host, surfaceId, messages, inert }: SurfaceViewProps) => {
  // A new surface is created before it renders (nothing listens to it yet); a later snapshot updates it after commit,
  // so the renderer's own subscribers never change during this render.
  if (!host.get(surfaceId)) host.upsert(surfaceId, messages)
  useLayoutEffect(() => void host.upsert(surfaceId, messages), [host, surfaceId, messages])
  const surface = host.get(surfaceId)
  if (!surface) return null
  return (
    <div className="a2-sf" data-surface={surfaceId} inert={inert}>
      <A2uiSurface surface={surface} />
    </div>
  )
}

export default SurfaceView
