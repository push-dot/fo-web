import { A2uiSurface } from '@a2ui/react/v0_9'
import type { A2uiMessage } from '@push/api-client'
import { useLayoutEffect } from 'react'
import './a2ui.css'
import { SurfaceAnswerable } from './components/view'
import type { SurfaceHost } from './surface-host'

type SurfaceViewProps = {
  host: SurfaceHost
  surfaceId: string
  messages: readonly A2uiMessage[]
  answerable: boolean
}

const SurfaceView = ({ host, surfaceId, messages, answerable }: SurfaceViewProps) => {
  if (!host.get(surfaceId)) host.upsert(surfaceId, messages)
  useLayoutEffect(() => void host.upsert(surfaceId, messages), [host, surfaceId, messages])
  const surface = host.get(surfaceId)
  if (!surface) return null
  return (
    <div className="a2-sf" data-surface={surfaceId}>
      <SurfaceAnswerable.Provider value={answerable}>
        <A2uiSurface surface={surface} />
      </SurfaceAnswerable.Provider>
    </div>
  )
}

export default SurfaceView
