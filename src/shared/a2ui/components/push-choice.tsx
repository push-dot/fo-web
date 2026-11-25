import { answerBody, type A2uiAnswerContext } from '@push/api-client'
import { useContext, useState } from 'react'
import { A2UI_ACTION, A2UI_COPY } from '../constants'
import { CheckMark, dispatch, SurfaceAnswerable, type ViewProps } from './view'

type Choice = { id: string; label: string; desc?: string; recommended?: boolean; change?: boolean }
type Question = {
  id: string
  title?: string
  detail?: string
  multiple?: boolean
  answerable?: boolean
  choices: Choice[]
}
type Selected = Record<string, string[]>

export type PushChoiceProps = {
  form?: 'list' | 'buttons'
  questions: Question[]
  answer: 'pick' | 'submit'
  submit?: { label: string; labels?: Record<string, string> }
  secondary?: { id: string; label: string }
  open: boolean
  picked: string[]
  selected?: Selected
  setSelected?: (value: Selected) => void
}

const answerable = (question: Question) => question.answerable !== false

const ownValue = <T,>(record: Record<string, T> | undefined, id: string) =>
  record && Object.hasOwn(record, id) ? record[id] : undefined

export const allPicks = (questions: Question[], selected: Selected) =>
  questions
    .filter(answerable)
    .flatMap((question) =>
      question.choices
        .filter((choice) => (ownValue(selected, question.id) ?? []).includes(choice.id))
        .map((choice) => choice.id),
    )

const toggle = (question: Question, current: string[], id: string) =>
  question.multiple
    ? current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id]
    : [id]

const Badge = () => <span className="a2-badge">{A2UI_COPY.recommended}</span>

const ChoiceCopy = ({ choice }: { choice: Choice }) => (
  <span className="a2-ot">
    {choice.label}
    {choice.desc ? <span className="a2-cp">{choice.desc}</span> : null}
  </span>
)

export const PushChoiceView = ({ props, context }: ViewProps<PushChoiceProps>) => {
  const [step, setStep] = useState(0)
  const [own, setOwn] = useState<Selected>({})
  const open = props.open === true
  const active = useContext(SurfaceAnswerable)
  const live = open && active
  const picked = props.picked ?? []
  const selected = props.selected ?? own
  const write = props.setSelected ?? setOwn
  const last = props.questions.length - 1
  const at = open ? Math.min(step, last) : last
  const question = props.questions[at]
  if (!question) return null
  const send = (body: A2uiAnswerContext) => dispatch(context, A2UI_ACTION.answer, body)
  const pick = (ids: string[]) => send(answerBody('pick', ids))
  const sel = (id: string) => (picked.includes(id) ? ' sel' : '')
  const done = live ? '' : ' done'

  if (props.form === 'buttons') {
    return (
      <div className={`a2-choice a2-bts${done}`}>
        {question.choices.map((choice, index) => (
          <button
            key={choice.id}
            type="button"
            className={`a2-bt ${index === question.choices.length - 1 ? 'pri' : 'sec'}${sel(choice.id)}`}
            disabled={!live}
            aria-pressed={live ? undefined : picked.includes(choice.id)}
            onClick={() => pick([choice.id])}
          >
            {choice.label}
          </button>
        ))}
      </div>
    )
  }

  const head = (
    <>
      {props.questions.length > 1 ? (
        <span className="a2-cp">
          {at + 1}/{props.questions.length}
        </span>
      ) : null}
      {question.title ? <span className="a2-tt">{question.title}</span> : null}
      {question.detail ? <span className="a2-ds">{question.detail}</span> : null}
    </>
  )
  const changeLink = (choice: Choice) =>
    choice.change ? (
      <button
        type="button"
        className="a2-lk"
        disabled={!live}
        onClick={() => dispatch(context, A2UI_ACTION.change, { optionId: choice.id })}
      >
        {A2UI_COPY.change}
      </button>
    ) : null

  if (!props.submit && !question.multiple && props.questions.length === 1) {
    return (
      <div className={`a2-choice${done}`}>
        {head}
        <div className="a2-ops">
          {question.choices.map((choice) => (
            <div key={choice.id} className="a2-op-row">
              <button
                type="button"
                className={`a2-op${sel(choice.id)}`}
                disabled={!live || !answerable(question)}
                aria-pressed={live ? undefined : picked.includes(choice.id)}
                onClick={() => pick([choice.id])}
              >
                <span className="a2-mk" aria-hidden="true">
                  <CheckMark />
                </span>
                <ChoiceCopy choice={choice} />
                {choice.recommended ? <Badge /> : null}
              </button>
              {changeLink(choice)}
            </div>
          ))}
        </div>
        {live ? <span className="a2-cp">{A2UI_COPY.sayInstead}</span> : null}
      </div>
    )
  }

  const current = ownValue(selected, question.id) ?? []
  const picks = allPicks(props.questions, selected)
  const final = at === last
  const submitLabel =
    (current.length === 1 && !question.multiple && ownValue(props.submit?.labels, current[0] ?? '')) ||
    props.submit?.label ||
    A2UI_COPY.next
  const submitBody = () =>
    props.answer === 'submit' ? answerBody('submit', picks) : answerBody('pick', picks)
  const submitted = props.secondary
    ? !picked.includes(props.secondary.id) && picked.length > 0
    : picked.length > 0
  const name = `${context.componentModel.id}-${question.id}`
  return (
    <div className={`a2-choice${done}`}>
      {head}
      <div className="a2-ops" role="group" aria-label={question.title ?? A2UI_COPY.question}>
        {question.choices.map((choice) => {
          const on = open ? current.includes(choice.id) : picked.includes(choice.id)
          return (
            <div key={choice.id} className="a2-op-row">
              {answerable(question) ? (
                <label className={`a2-op${on ? ' sel' : ''}${question.multiple ? ' multi' : ''}`}>
                  <input
                    className="sr-only"
                    type={question.multiple ? 'checkbox' : 'radio'}
                    name={name}
                    value={choice.id}
                    checked={on}
                    disabled={!live}
                    onChange={() =>
                      write({ ...selected, [question.id]: toggle(question, current, choice.id) })
                    }
                  />
                  <span className="a2-mk" aria-hidden="true">
                    <CheckMark />
                  </span>
                  <ChoiceCopy choice={choice} />
                  {choice.recommended ? <Badge /> : null}
                </label>
              ) : (
                <div className="a2-op">
                  <ChoiceCopy choice={choice} />
                </div>
              )}
              {changeLink(choice)}
            </div>
          )
        })}
      </div>
      <div className="a2-bts">
        {props.secondary ? (
          <button
            type="button"
            className={`a2-bt sec${sel(props.secondary.id)}`}
            disabled={!live}
            onClick={() => pick([props.secondary?.id ?? ''])}
          >
            {props.secondary.label}
          </button>
        ) : null}
        {final ? (
          <button
            type="button"
            className={`a2-bt pri${!open && submitted ? ' sel' : ''}`}
            disabled={!live || (props.answer === 'pick' && picks.length === 0)}
            onClick={() => send(submitBody())}
          >
            {submitLabel}
          </button>
        ) : (
          <button
            type="button"
            className="a2-bt pri"
            disabled={!live}
            onClick={() => setStep(at + 1)}
          >
            {A2UI_COPY.next}
          </button>
        )}
      </div>
    </div>
  )
}
