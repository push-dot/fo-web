import {
  mePosts as fetchMyPosts,
  postsComments as fetchComments,
  postsGet as fetchPost,
  postsList as fetchPosts,
  postsComment as postsCommentOp,
  uploadsImage as uploadsImageOp,
  postsCreate as postsCreateOp,
} from '../../../shared/api/operations'

export const postsGet = (...args: Parameters<typeof fetchPost>) => fetchPost(...args)

export const postsList = (...args: Parameters<typeof fetchPosts>) => fetchPosts(...args)

export const postsComments = (...args: Parameters<typeof fetchComments>) => fetchComments(...args)

export const mePosts = (...args: Parameters<typeof fetchMyPosts>) => fetchMyPosts(...args)

export const postsComment = (...args: Parameters<typeof postsCommentOp>) => postsCommentOp(...args)

export const uploadsImage = (...args: Parameters<typeof uploadsImageOp>) => uploadsImageOp(...args)

export const postsCreate = (...args: Parameters<typeof postsCreateOp>) => postsCreateOp(...args)
