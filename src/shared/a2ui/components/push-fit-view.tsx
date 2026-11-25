import { useState } from 'react'
import { A2UI_ACTION, A2UI_COPY, LOCKED_FIT_SAMPLE } from '../constants'
import { dispatch } from './view'
import type { ViewProps, PushFitProps } from './types'

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

const PushFitView = ({ props, context }: ViewProps<PushFitProps>) => {
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

export default PushFitView
