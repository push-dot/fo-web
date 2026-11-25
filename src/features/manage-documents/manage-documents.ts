import type { SourceItem } from '@push/api-client'
import {
  applicationsList,
  documentsArchive,
  documentsExportFile,
  documentsGet,
  documentsRename,
  documentsRestore,
  sourcesContent,
  sourcesRemove,
} from '../../shared/api/operations'

const APPLICATION_LOOKUP_LIMIT = 100
const REVOKE_AFTER_MS = 60_000

export const isPushDocument = (item: Pick<SourceItem, 'origin'>) => item.origin === 'AI'

export const removeDocument = (item: Pick<SourceItem, 'id' | 'origin'>) =>
  isPushDocument(item) ? documentsArchive(item.id) : sourcesRemove(item.id)

export const archivedRevision = (removed: unknown) => {
  if (!removed || typeof removed !== 'object' || !('revision' in removed)) return null
  const revision = removed.revision
  return typeof revision === 'number' ? revision : null
}

export const restoreDocument = (item: Pick<SourceItem, 'id' | 'origin'>, removed: unknown) => {
  const revision = archivedRevision(removed)
  if (!isPushDocument(item) || revision == null) return Promise.resolve()
  return documentsRestore(item.id, revision)
}

export const renameDocument = (id: string, title: string) => documentsRename(id, title)

const documentResponse = async (item: SourceItem) => {
  if (!isPushDocument(item)) return sourcesContent(item.id)
  const doc = await documentsGet(item.id)
  const version = doc.finalizedVersionId ?? doc.latestVersionId
  if (!version) throw new Error('document has no version')
  return documentsExportFile(item.id, version, 'PDF')
}

export const blobTypeFor = (serverType: string) =>
  serverType.split(';')[0]?.trim().toLowerCase() === 'application/pdf' ? 'application/pdf' : 'application/octet-stream'

export const openDocument = async (item: SourceItem, download: boolean) => {
  const tab = download ? null : window.open('', '_blank')
  try {
    const source = await (await documentResponse(item)).blob()
    const type = blobTypeFor(source.type)
    const url = URL.createObjectURL(new Blob([source], { type }))
    window.setTimeout(() => URL.revokeObjectURL(url), REVOKE_AFTER_MS)
    if (tab && type === 'application/pdf') {
      tab.location.href = url
      return
    }
    tab?.close()
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = isPushDocument(item) ? `${item.fileName}.pdf` : item.fileName
    anchor.click()
  } catch (error) {
    tab?.close()
    throw error
  }
}

export const documentPostingId = async (item: Pick<SourceItem, 'company' | 'postingTitle'>) => {
  const page = await applicationsList({ limit: APPLICATION_LOOKUP_LIMIT })
  return (
    page.data.find(
      (application) =>
        application.company === item.company && application.title === item.postingTitle,
    )?.jobId ?? null
  )
}
