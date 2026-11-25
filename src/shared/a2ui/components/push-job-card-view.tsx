import { sanitizeMediaUrl } from '@a2ui/web_core'
import { brandColor } from '@push/shared'
import Icon from '../../ui/icon'
import { A2UI_ACTION, A2UI_COPY } from '../constants'
import { dispatch } from './view'
import type { ViewProps, PushJobCardProps } from './types'

const PushJobCardView = ({ props, context }: ViewProps<PushJobCardProps>) => {
  const image = sanitizeMediaUrl(props.imageUrl)
  return (
    <button
      type="button"
      className="a2-jc"
      onClick={() => dispatch(context, A2UI_ACTION.openPosting, { postingId: props.postingId })}
    >
      <span className="a2-ph" style={image ? undefined : { background: brandColor(props.company) }}>
        {image ? (
          <img src={image} alt="" />
        ) : (
          <span aria-hidden="true">{props.company.slice(0, 1)}</span>
        )}
        {props.bookmarked ? (
          <span className="a2-bm">
            <Icon name="bookmark" size={16} filled />
            <span className="sr-only">{A2UI_COPY.bookmarked}</span>
          </span>
        ) : null}
      </span>
      <span className="a2-cp">{props.company}</span>
      <span className="a2-jt">{props.title}</span>
      {props.meta ? <span className="a2-c2">{props.meta}</span> : null}
    </button>
  )
}

export default PushJobCardView
