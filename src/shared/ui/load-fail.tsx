import { useNavigate } from 'react-router-dom'
import Icon from './icon'
import PageState, { LOAD_FAIL } from './page-state'

const LoadFail = ({ onRetry }: { onRetry?: () => void }) => {
  const navigate = useNavigate()
  return (
    <PageState
      top={
        <span className="state-tile big">
          <Icon name="warn" size={36} />
        </span>
      }
      title={LOAD_FAIL.title}
      body={LOAD_FAIL.body}
    >
      <button type="button" className="btn sec" onClick={() => navigate('/')}>
        {LOAD_FAIL.home}
      </button>
      <button
        type="button"
        className="btn pri"
        onClick={onRetry ?? (() => window.location.reload())}
      >
        <Icon name="retry" size={18} width={2.2} />
        {LOAD_FAIL.retry}
      </button>
    </PageState>
  )
}

export default LoadFail
