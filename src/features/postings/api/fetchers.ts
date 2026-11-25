import {
  meBookmarks as fetchBookmarks,
  postingsGet as fetchPosting,
  postingsList as fetchPostings,
  postingsLocations as fetchPostingLocations,
  postingsMine as fetchMyPostings,
  postingsApply as postingsApplyOp,
  postingsBookmark as postingsBookmarkOp,
  postingsUnbookmark as postingsUnbookmarkOp,
  postingsCreate as postingsCreateOp,
  postingsUpdate as postingsUpdateOp,
  postingsClose as postingsCloseOp,
  uploadsImage as uploadsImageOp,
} from '../../../shared/api/operations'

export const postingsGet = (...args: Parameters<typeof fetchPosting>) => fetchPosting(...args)

export const postingsList = (...args: Parameters<typeof fetchPostings>) => fetchPostings(...args)

export const postingsLocations = (...args: Parameters<typeof fetchPostingLocations>) =>
  fetchPostingLocations(...args)

export const postingsMine = (...args: Parameters<typeof fetchMyPostings>) =>
  fetchMyPostings(...args)

export const meBookmarks = (...args: Parameters<typeof fetchBookmarks>) => fetchBookmarks(...args)

export const postingsApply = (...args: Parameters<typeof postingsApplyOp>) =>
  postingsApplyOp(...args)

export const postingsBookmark = (...args: Parameters<typeof postingsBookmarkOp>) =>
  postingsBookmarkOp(...args)

export const postingsUnbookmark = (...args: Parameters<typeof postingsUnbookmarkOp>) =>
  postingsUnbookmarkOp(...args)

export const postingsCreate = (...args: Parameters<typeof postingsCreateOp>) =>
  postingsCreateOp(...args)

export const postingsUpdate = (...args: Parameters<typeof postingsUpdateOp>) =>
  postingsUpdateOp(...args)

export const postingsClose = (...args: Parameters<typeof postingsCloseOp>) =>
  postingsCloseOp(...args)

export const uploadsImage = (...args: Parameters<typeof uploadsImageOp>) => uploadsImageOp(...args)
