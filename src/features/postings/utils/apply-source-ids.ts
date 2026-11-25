import type { SourceItem } from '@push/api-client'

export const applySourceIds = (sources: Pick<SourceItem, 'id' | 'origin'>[], selected: string[]) => {
  const picked = sources.filter((source) => selected.includes(source.id))
  const ids = (ai: boolean) => picked.filter((source) => (source.origin === 'AI') === ai).map((source) => source.id)
  return { documentIds: ids(true), sourceIds: ids(false) }
}
