import Icon from '../shared/ui/icon'
import PageState, { LOAD_FAIL } from '../shared/ui/page-state'

const ErrorScreen = ({ onHome, onRetry }: { onHome?: () => void; onRetry: () => void }) => (
  <PageState
    top={
      <span className="state-tile big">
        <Icon name="warn" size={36} />
      </span>
    }
    title={LOAD_FAIL.title}
    body={LOAD_FAIL.body}
  >
    {onHome && (
      <button type="button" className="btn sec" onClick={onHome}>
        {LOAD_FAIL.home}
      </button>
    )}
    <button type="button" className="btn pri" onClick={onRetry}>
      <Icon name="retry" size={18} width={2.2} />
      {LOAD_FAIL.retry}
    </button>
  </PageState>
)

export default ErrorScreen
