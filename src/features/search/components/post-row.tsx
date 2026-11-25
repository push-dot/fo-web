import type { Post } from '@push/api-client'
import { Link } from 'react-router-dom'
import Highlight from './highlight'

const PostRow = ({ post, q }: { post: Post; q: string }) => (
  <Link to={`/posts/${post.id}`} className="search-row">
    <span className="search-copy">
      <strong className="b1 w7">
        <Highlight text={post.title} query={q} />
      </strong>
      <span className="c1 t3">
        <Highlight text={post.body} query={q} />
      </span>
    </span>
  </Link>
)

export default PostRow
