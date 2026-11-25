import { useBookmarks } from '../api/hooks'
import { LOAD_FAIL } from '../../../shared/ui/page-state'
import CardSkeletons from '../../../shared/ui/card-skeletons'
import StateBlock from '../../../shared/ui/state-block'
import ErrorState from '../../../shared/ui/error-state'
import PostingCard from './posting-card'
import { ACTIVITY_LOAD_ERROR } from '../../../shared/ui/constants'
import { listTotal } from '../../../shared/lib/format'
import { BOOKMARK_EMPTY, BOOKMARK_EMPTY_SUB, bookmarkCount } from '../constants'

const BookmarkPanel = () => {
  const query = useBookmarks()
  if (query.isLoading) return <CardSkeletons count={3} />
  if (query.isError || !query.data) return <ErrorState boxed title={ACTIVITY_LOAD_ERROR} description={LOAD_FAIL.body} onRetry={() => void query.refetch()} />
  if (query.data.data.length === 0) return <StateBlock boxed icon="bookmark" title={BOOKMARK_EMPTY} description={BOOKMARK_EMPTY_SUB} />
  return (
    <>
      <p className="b2 t3 my-count">{bookmarkCount(listTotal(query.data))}</p>
      <div className="my-bookmarks">
        {query.data.data.map((posting) => (
          <PostingCard key={posting.id} posting={posting} />
        ))}
      </div>
    </>
  )
}

export default BookmarkPanel
