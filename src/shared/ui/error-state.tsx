import Icon from './icon'
import StateBlock from './state-block'

const ErrorState = ({
  title,
  description,
  onRetry,
  retryLabel = '다시 시도',
  boxed,
}: {
  title: string
  description?: string
  onRetry?: () => void
  retryLabel?: string
  boxed?: boolean
}) => (
  <StateBlock
    icon="warn"
    error
    boxed={boxed}
    title={title}
    description={description}
    action={
      onRetry ? (
        <button type="button" className="btn sec sm" onClick={onRetry}>
          <Icon name="retry" size={16} width={2.2} />
          {retryLabel}
        </button>
      ) : undefined
    }
  />
)

export default ErrorState
