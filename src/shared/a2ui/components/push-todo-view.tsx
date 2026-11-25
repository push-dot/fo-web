import { A2UI_COPY } from '../constants'
import CheckMark from './check-mark'
import type { ViewProps, PushTodoProps } from './types'

const PushTodoView = ({ props }: ViewProps<PushTodoProps>) => (
  <ol className="a2-td">
    {(props.items ?? []).map((item, index) => (
      <li key={`${index}-${item.text}`} className={`a2-ti ${item.state}`}>
        <span className="a2-tm" aria-hidden="true">
          {item.state === 'done' ? <CheckMark /> : item.state === 'running' ? <i /> : index + 1}
        </span>
        <span className="sr-only">{A2UI_COPY.todoState[item.state]}</span>
        <span className="a2-tx">{item.text}</span>
      </li>
    ))}
  </ol>
)

export default PushTodoView
