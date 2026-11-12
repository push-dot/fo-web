import { POST_CATEGORIES, type PostCategory } from '@push/api-client'

export const postCategoryLabel = (key: PostCategory | string) =>
  POST_CATEGORIES.find((item) => item.key === key)?.label ?? key
