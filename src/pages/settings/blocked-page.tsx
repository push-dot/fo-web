import { Link } from 'react-router-dom'

import { MySide } from '../../features/profile'
import { useBlocks } from '../../features/auth'
import Icon from '../../shared/ui/icon'
import { LOAD_FAIL } from '../../shared/ui/page-state'
import Skeleton from '../../shared/ui/skeleton'
import StateBlock from '../../shared/ui/state-block'
import ErrorState from '../../shared/ui/error-state'
import Toast, { useToast } from '../../shared/ui/toast'
import { BlockedRow, BLOCKED_COPY } from '../../features/settings'

const BlockedPage = () => {
  const query = useBlocks()
  const toast = useToast()
  const rows = query.data?.data ?? []
  return (
    <main className="page settings my-layout">
      <MySide />
      <div className="my-main">
        <Link to="/settings" className="b2 w6 t3 back set-back">
          <Icon name="back" size={18} />
          {BLOCKED_COPY.back}
        </Link>
        <h1 className="h1">{BLOCKED_COPY.title}</h1>
        <p className="b2 t3 set-intro">{BLOCKED_COPY.intro}</p>
        {query.isLoading ? <Skeleton rows={2} /> : null}
        {query.isError ? <ErrorState boxed title={BLOCKED_COPY.loadFailed} description={LOAD_FAIL.body} onRetry={() => void query.refetch()} /> : null}
        {query.data && rows.length === 0 ? <StateBlock boxed icon="ban" title={BLOCKED_COPY.empty} /> : null}
        {rows.length > 0 ? (
          <>
            <ul className="box my-rows">
              {rows.map((row) => (
                <BlockedRow key={row.user.id} row={row} onFailed={() => toast.show(BLOCKED_COPY.failed, { tone: 'err' })} />
              ))}
            </ul>
            <p className="c1 t3 set-foot">{BLOCKED_COPY.note}</p>
          </>
        ) : null}
      </div>
      <Toast message={toast.message} tone={toast.tone} action={toast.action} />
    </main>
  )
}

export default BlockedPage
