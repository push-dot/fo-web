import type { Post } from '@push/api-client'
import { Link } from 'react-router-dom'

import { postCategoryLabel } from '../../entities/post'
import { compactCount } from '../../shared/lib/format'
import { Icon } from '../../shared/ui/icon'
import { postAge } from './lib'

const MyPostRow = ({ post }: { post: Post }) => {
  const category = postCategoryLabel(post.category)
  return (
    <li>
      <Link to={`/posts/${post.id}`} className="my-post">
        <span className="c1 t3">{`${category} · ${postAge(post.createdAt)}`}</span>
        <span className="h3">{post.title}</span>
        <span className="b2 t2 my-post-excerpt">{post.body}</span>
        <span className="c1 t3 my-post-meta">
          <Icon name="chat" size={14} />
          {compactCount(post.commentCount)}
        </span>
      </Link>
    </li>
  )
}

export default MyPostRow
