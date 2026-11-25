import { A2UI_ACTION, A2UI_COPY } from '../constants'
import { dispatch } from './view'
import type { ViewProps, PushDiffProps } from './types'

const DIFF_SIGN = { '+': ['add', '+'], '-': ['del', '−'], '': ['ctx', ''] } as const

const PushDiffView = ({ props, context }: ViewProps<PushDiffProps>) => (
  <div className="a2-stack">
    {props.caption ? <span className="a2-cp">{props.caption}</span> : null}
    <span className="a2-tt">{props.title}</span>
    <div className="a2-df">
      {props.lines.map((line, index) => {
        const [tone, mark] = DIFF_SIGN[line.sign]
        return (
          <div key={index} className={`a2-dl ${tone}`}>
            <span className="a2-sg" aria-hidden="true">
              {mark}
            </span>
            {line.sign ? <span className="sr-only">{A2UI_COPY.diffSign[line.sign]}</span> : null}
            <span className="a2-tx">{line.text}</span>
          </div>
        )
      })}
    </div>
    {props.documentId ? (
      <button
        type="button"
        className="a2-lk"
        onClick={() => dispatch(context, A2UI_ACTION.openReview, { documentId: props.documentId })}
      >
        {A2UI_COPY.viewAll}
      </button>
    ) : null}
  </div>
)

export default PushDiffView
