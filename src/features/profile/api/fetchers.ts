import {
  meFollows as fetchFollows,
  meLinks as fetchLinks,
  meProfile as fetchMyProfile,
  profilesGet as fetchProfile,
  profilesList as fetchProfiles,
  meAddLink as meAddLinkOp,
  profilesFollow as profilesFollowOp,
  profilesUnfollow as profilesUnfollowOp,
  applicationsList,
  documentsArchive,
  documentsExportFile,
  documentsGet,
  documentsRename,
  documentsRestore,
  sourcesContent,
  sourcesRemove,
  meDeleteLink,
  meRestoreLink,
  meUpdateProfile as meUpdateProfileOp,
  uploadsImage,
  sourcesUpload,
} from '../../../shared/api/operations'
import type { SourceItem } from '@push/api-client'
import { isPushDocument, archivedRevision, blobTypeFor } from '../utils/documents'
import { rememberSource } from '../../../shared/api/sources'

export const profilesGet = (...args: Parameters<typeof fetchProfile>) => fetchProfile(...args)

export const profilesList = (...args: Parameters<typeof fetchProfiles>) => fetchProfiles(...args)

export const meProfile = (...args: Parameters<typeof fetchMyProfile>) => fetchMyProfile(...args)

export const meLinks = (...args: Parameters<typeof fetchLinks>) => fetchLinks(...args)

export const meFollows = (...args: Parameters<typeof fetchFollows>) => fetchFollows(...args)

export const meAddLink = (...args: Parameters<typeof meAddLinkOp>) => meAddLinkOp(...args)

export const profilesFollow = (...args: Parameters<typeof profilesFollowOp>) =>
  profilesFollowOp(...args)

export const profilesUnfollow = (...args: Parameters<typeof profilesUnfollowOp>) =>
  profilesUnfollowOp(...args)

const APPLICATION_LOOKUP_LIMIT = 100

const REVOKE_AFTER_MS = 60_000

export const removeDocument = (item: Pick<SourceItem, 'id' | 'origin'>) =>
  isPushDocument(item) ? documentsArchive(item.id) : sourcesRemove(item.id)

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

export const removeLink = (id: string) => meDeleteLink(id)

export const restoreLink = (id: string) => meRestoreLink(id)

export const meUpdateProfile = (...args: Parameters<typeof meUpdateProfileOp>) =>
  meUpdateProfileOp(...args)

export const uploadAvatar = (file: File) => {
  const form = new FormData()
  form.set('file', file)
  return uploadsImage(form)
}

export const uploadResume = async (file: File) => {
  const form = new FormData()
  form.set('file', file)
  form.set('kind', 'resume')
  const source = await sourcesUpload(form)
  rememberSource(source)
  return source
}
