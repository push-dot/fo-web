import type { PostsListParams } from '@push/api-client'

export const COMPOSER_PROMPT = '어떤 이야기를 나눌까요?'

export const POST_EMPTY = '아직 쓴 글이 없어요.'

export const POST_EMPTY_SUB = '소셜에 첫 글을 올려 보세요.'

export const POST_EMPTY_ACTION = '글쓰기'

export const COMMENTED_EMPTY = '아직 댓글 단 글이 없어요.'

export const POSTS_VIEWS = [
  { key: 'mine', label: '내가 쓴 글' },
  { key: 'commented', label: '댓글 단 글' },
] as const

export const POSTS_VIEW_LABEL = '보기'

export const POPULAR_FETCH = 10

export const POPULAR_COUNT = 3

export const POST_TITLE_MAX = 100

export const POST_BODY_MAX = 5000

export const POST_IMAGE_MAX = 4

export const COMMENT_MAX = 1000

export const EMPLOYER_BADGE = '기업'

export const COMPOSER_ACTION = '글쓰기'

export const COMPOSE_CANCEL = '취소'

export const COMPOSE_SUBMIT = '올리기'

export const COMPOSE_CATEGORY_HINT = '카테고리를 선택해 주세요'

export const COMPOSE_ERRORS = {
  category: '카테고리를 선택해 주세요.',
  title: '제목을 입력해 주세요.',
  body: '내용을 입력해 주세요.',
}

export const REPLY_PLACEHOLDER = '답글을 남겨 주세요'

export const POST_THUMBS = 2

export const POPULAR_PARAMS: PostsListParams = {
  limit: POPULAR_FETCH,
  sort: 'popular',
  period: 'week',
}
