import type { SourceItem } from '@push/api-client'

export const isPushDocument = (item: Pick<SourceItem, 'origin'>) => item.origin === 'AI'

export const archivedRevision = (removed: unknown) => {
  if (!removed || typeof removed !== 'object' || !('revision' in removed)) return null
  const revision = removed.revision
  return typeof revision === 'number' ? revision : null
}

export const blobTypeFor = (serverType: string) =>
  serverType.split(';')[0]?.trim().toLowerCase() === 'application/pdf'
    ? 'application/pdf'
    : 'application/octet-stream'
