import type { Post } from '@push/api-client'
import { Link } from 'react-router-dom'

import { authorLabel, postCategoryLabel } from '../../entities/post'
import { assetUrl } from '../../shared/api/client'
import { relativeTime } from '../../shared/lib/format'
import { Icon } from '../../shared/ui/icon'
import AuthorAvatar from './author-avatar'
import EmployerBadge from './employer-badge'
import { POST_THUMBS } from './constants'

const PostCard = ({ post }: { post: Post }) => {
  const category = postCategoryLabel(post.category)
  return (
    <Link to={`/posts/${post.id}`} className="post-card">
      <span className="post-head">
        <AuthorAvatar author={post.author} size={40} />
        <span className="post-who">
          <span className="b2 w7 post-name">
            {authorLabel(post.author)}
            {post.author.employer ? <EmployerBadge /> : null}
          </span>
          <span className="c1 t3">{`${category} · ${relativeTime(post.createdAt)}`}</span>
        </span>
      </span>
      <strong className="h3">{post.title}</strong>
      <p className="b2 t2 post-excerpt">{post.body}</p>
      {post.imageUrls.length > 0 ? (
        <span className="post-thumbs">
          {post.imageUrls.slice(0, POST_THUMBS).map((url) => (
            <img key={url} src={assetUrl(url)} alt="" />
          ))}
        </span>
      ) : null}
      <span className="c1 t3 post-count">
        <Icon name="chat" size={15} />
        <span className="sr-only">댓글</span>
        {post.commentCount}
      </span>
    </Link>
  )
}

export default PostCard
