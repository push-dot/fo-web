import { Link } from 'react-router-dom'

import { useFollows } from '../api/hooks'
import { LOAD_FAIL } from '../../../shared/ui/page-state'
import Skeleton from '../../../shared/ui/skeleton'
import StateBlock from '../../../shared/ui/state-block'
import ErrorState from '../../../shared/ui/error-state'
import { FOLLOW_EMPTY, FOLLOW_EMPTY_ACTION, FOLLOW_EMPTY_SUB, followCount } from '../constants'
import FollowRow from './follow-row'
import { ACTIVITY_LOAD_ERROR } from '../../../shared/ui/constants'
import { listTotal } from '../../../shared/lib/format'

const FollowPanel = () => {
  const query = useFollows()
  if (query.isLoading) return <Skeleton rows={4} />
  if (query.isError || !query.data) return <ErrorState boxed title={ACTIVITY_LOAD_ERROR} description={LOAD_FAIL.body} onRetry={() => void query.refetch()} />
  if (query.data.data.length === 0) {
    return (
      <StateBlock
        boxed
        icon="people"
        title={FOLLOW_EMPTY}
        description={FOLLOW_EMPTY_SUB}
        action={
          <Link to="/hub" className="btn pri sm">
            {FOLLOW_EMPTY_ACTION}
          </Link>
        }
      />
    )
  }
  return (
    <>
      <p className="b2 t3 my-count">{followCount(listTotal(query.data))}</p>
      <ul className="box my-rows">
        {query.data.data.map((profile) => (
          <FollowRow key={profile.userId} profile={profile} />
        ))}
      </ul>
    </>
  )
}

export default FollowPanel
