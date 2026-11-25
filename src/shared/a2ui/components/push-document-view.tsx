import Icon from '../../ui/icon'
import { A2UI_ACTION, A2UI_COPY } from '../constants'
import { dispatch } from './view'
import type { ViewProps, PushDocumentProps } from './types'

const PushDocumentView = ({ props, context }: ViewProps<PushDocumentProps>) => {
  const { documentId } = props
  const file = (
    <>
      <span className="a2-di" aria-hidden="true">
        <Icon name="doc" size={20} />
      </span>
      <span className="a2-dn">
        <b>{props.name}</b>
        {props.meta ? <span className="a2-cp">{props.meta}</span> : null}
      </span>
    </>
  )
  const actions = props.status === 'writing' ? [] : (props.actions ?? [])
  return (
    <div className="a2-stack">
      <span className="a2-tt">{props.title}</span>
      <div className="a2-dc">
        {documentId ? (
          <button
            type="button"
            className="a2-dc-open"
            onClick={() => dispatch(context, A2UI_ACTION.openReview, { documentId })}
          >
            {file}
          </button>
        ) : (
          <span className="a2-dc-open">{file}</span>
        )}
        {props.share && documentId ? (
          <button
            type="button"
            className="a2-ib"
            aria-label={A2UI_COPY.share}
            onClick={() => dispatch(context, A2UI_ACTION.share, { documentId })}
          >
            <Icon name="share" size={20} />
          </button>
        ) : null}
      </div>
      {props.lines?.length ? <div className="a2-ds a2-lines">{props.lines.join('\n')}</div> : null}
      {actions.length ? (
        <div className="a2-bts col">
          {actions.map((action, index) => (
            <button
              key={action.id}
              type="button"
              className={`a2-bt ${index === 0 ? 'pri' : 'sec'}`}
              onClick={() =>
                dispatch(context, A2UI_ACTION.resultAction, {
                  id: action.id,
                  ...(action.method ? { method: action.method } : {}),
                  ...(action.path ? { path: action.path } : {}),
                })
              }
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default PushDocumentView
