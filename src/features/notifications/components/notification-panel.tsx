import { useNotifications, useNoticeActions } from '../api/hooks'
import Skeleton from '../../../shared/ui/skeleton'
import StateBlock from '../../../shared/ui/state-block'
import ErrorState from '../../../shared/ui/error-state'
import {
  NOTIFICATION_EMPTY,
  NOTIFICATION_ERROR,
  NOTIFICATION_NOTE,
  NOTIFICATION_READ_ALL,
  NOTIFICATION_TITLE,
} from '../constants'
import NoticeRow from './notice-row'

const NotificationPanel = ({ onClose }: { onClose: () => void }) => {
  const query = useNotifications()
  const { read, open } = useNoticeActions(onClose)
  const items = query.data?.data ?? []
  const unread = items.some((notice) => !notice.readAt)
  return (
    <>
      <div className="notif-head">
        <span className="h3">{NOTIFICATION_TITLE}</span>
        {items.length > 0 ? (
          <button
            type="button"
            className="c1 w7"
            disabled={read.isPending || !unread}
            onClick={() => read.mutate('all')}
          >
            {NOTIFICATION_READ_ALL}
          </button>
        ) : null}
      </div>
      {query.isLoading ? <Skeleton rows={3} /> : null}
      {query.isError && items.length === 0 ? (
        <ErrorState title={NOTIFICATION_ERROR} onRetry={() => void query.refetch()} />
      ) : null}
      {query.isSuccess && items.length === 0 ? (
        <StateBlock icon="bell" title={NOTIFICATION_EMPTY} />
      ) : null}
      {items.length > 0 ? (
        <div className="notif-list">
          {items.map((notice) => (
            <NoticeRow key={notice.id} notice={notice} onOpen={(next) => void open(next)} />
          ))}
        </div>
      ) : null}
      <p className="c1 t3 notif-foot">{NOTIFICATION_NOTE}</p>
    </>
  )
}

export default NotificationPanel
