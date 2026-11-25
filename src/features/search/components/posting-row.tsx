import type { Posting } from '@push/api-client'
import { brandColor, careerLabel } from '@push/shared'
import { Link } from 'react-router-dom'
import Icon from '../../../shared/ui/icon'
import Highlight from './highlight'

const PostingRow = ({ posting, q }: { posting: Posting; q: string }) => (
  <Link to={`/postings/${posting.id}`} className="search-row">
    <span className="ph" style={{ background: brandColor(posting.company) }}>
      {[...posting.company][0]}
    </span>
    <span className="search-copy">
      <span className="c1 t3 w6">
        <Highlight text={posting.company} query={q} />
      </span>
      <strong className="b1 w7">
        <Highlight text={posting.title} query={q} />
      </strong>
      <span className="c1 t3">
        {posting.location} · {careerLabel(posting)}
      </span>
    </span>
    <span className={posting.bookmarked ? 'search-bm on' : 'search-bm'}>
      <Icon name="bookmark" size={22} filled={posting.bookmarked} />
    </span>
  </Link>
)

export default PostingRow
