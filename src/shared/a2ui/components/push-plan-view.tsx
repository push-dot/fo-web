import type { ViewProps, PushPlanProps } from './types'

const PushPlanView = ({ props }: ViewProps<PushPlanProps>) => (
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

export default PushPlanView
