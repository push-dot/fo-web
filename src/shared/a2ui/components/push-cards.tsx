import { sanitizeMediaUrl } from '@a2ui/web_core'
import { brandColor } from '@push/shared'
import { useState } from 'react'
import { Icon } from '../../ui/icon'
import { A2UI_ACTION, A2UI_COPY, LOCKED_FIT_SAMPLE } from '../constants'
import { CheckMark, dispatch, type ViewProps } from './view'

export type PushTodoProps = { items: { text: string; state: 'done' | 'running' | 'waiting' }[] }

export const PushTodoView = ({ props }: ViewProps<PushTodoProps>) => (
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

export type PushDiffProps = {
  caption?: string
  title: string
  lines: { sign: '+' | '-' | ''; text: string }[]
  documentId?: string
}

const DIFF_SIGN = { '+': ['add', '+'], '-': ['del', '−'], '': ['ctx', ''] } as const

export const PushDiffView = ({ props, context }: ViewProps<PushDiffProps>) => (
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

export type PushPlanProps = {
  caption?: string
  title: string
  rows: { tag: string; tone: 'accent' | 'green' | 'orange'; label: string; note: string }[]
  keywords?: string[]
}

export const PushPlanView = ({ props }: ViewProps<PushPlanProps>) => (
  <div className="a2-stack">
    {props.caption ? <span className="a2-cp">{props.caption}</span> : null}
    <span className="a2-tt">{props.title}</span>
    <div className="a2-pl">
      {props.rows.map((row, index) => (
        <div key={`${index}-${row.label}`} className="a2-pr">
          <span className={`a2-tg ${row.tone}`}>{row.tag}</span>
          <b>{row.label}</b>
          {row.note ? <span className="a2-cp">{row.note}</span> : null}
        </div>
      ))}
    </div>
    {props.keywords?.length ? (
      <div className="a2-kw">
        {props.keywords.map((word) => (
          <span key={word} className="a2-kc">
            {word}
          </span>
        ))}
      </div>
    ) : null}
  </div>
)

export type PushFitProps = {
  score: string
  sentence: string
  summary?: string
  items?: { label: string; score: number }[]
  missing?: string[]
  rounds?: string[]
  locked?: boolean
}

const Bars = ({ items }: { items: readonly { label: string; score: number }[] }) => (
  <div className="a2-brs">
    {items.map((item) => (
      <div key={item.label} className="a2-br">
        <span>{item.label}</span>
        <span className="a2-tr">
          <i style={{ width: `${Math.max(0, Math.min(10, item.score)) * 10}%` }} />
        </span>
        <span className="a2-n">{item.score.toFixed(1)}</span>
      </div>
    ))}
  </div>
)

export const PushFitView = ({ props, context }: ViewProps<PushFitProps>) => {
  const [shown, setShown] = useState(false)
  return (
    <div className="a2-stack">
      <div className="a2-sc">
        <b>{props.score}</b>
        <span className="a2-ds">{props.sentence}</span>
      </div>
      {props.summary ? <span className="a2-ds">{props.summary}</span> : null}
      {props.rounds?.length ? (
        <ul className="a2-rounds">
          {props.rounds.map((round) => (
            <li key={round} className="a2-ds">
              {round}
            </li>
          ))}
        </ul>
      ) : null}
      {props.locked ? (
        <>
          <div className="a2-locked" aria-hidden="true">
            <Bars items={LOCKED_FIT_SAMPLE} />
          </div>
          <div className="a2-bts">
            <button
              type="button"
              className="a2-bt pri"
              onClick={() => dispatch(context, A2UI_ACTION.openPlan, {})}
            >
              {A2UI_COPY.upgrade}
            </button>
          </div>
        </>
      ) : props.items?.length ? (
        <>
          {shown ? <Bars items={props.items} /> : null}
          <button
            type="button"
            className="a2-lk"
            aria-expanded={shown}
            onClick={() => setShown(!shown)}
          >
            {shown ? A2UI_COPY.scoresClose : A2UI_COPY.scoresOpen}
          </button>
        </>
      ) : null}
      {props.missing?.length ? <span className="a2-cp">{props.missing.join(' · ')}</span> : null}
    </div>
  )
}

export type PushDocumentProps = {
  status: 'done' | 'writing' | 'failed'
  title: string
  name: string
  meta?: string
  lines?: string[]
  documentId?: string
  share?: boolean
  actions?: { id: string; label: string; method?: string; path?: string }[]
}

export const PushDocumentView = ({ props, context }: ViewProps<PushDocumentProps>) => {
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

export type PushJobCardProps = {
  postingId: string
  company: string
  title: string
  meta?: string
  imageUrl?: string
  bookmarked?: boolean
}

export const PushJobCardView = ({ props, context }: ViewProps<PushJobCardProps>) => {
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
