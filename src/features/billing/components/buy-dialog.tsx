import { useState, type FormEvent } from 'react'
import { topupReady } from '../../../shared/model/employer-plans'
import Dialog from '../../../shared/ui/dialog'
import {
  PLAN_BUY,
  BUY_TERMS,
  PLAN_BUY_PACKS,
  PLAN_BUY_TITLE,
  PLAN_CANCEL,
  buyTotal,
  planBuyPackHint,
} from '../constants'
import DialogHead from './dialog-head'

const BuyDialog = ({
  packPrice,
  pending,
  error,
  onSubmit,
  onClose,
}: {
  packPrice: number
  pending: boolean
  error: string | null
  onSubmit: (packs: number) => void
  onClose: () => void
}) => {
  const [packsText, setPacksText] = useState('1')
  const packs = Number(packsText)
  const ready = topupReady(packs)
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (ready && !pending) onSubmit(packs)
  }
  return (
    <Dialog label={PLAN_BUY_TITLE} onClose={onClose} className="plan-dialog">
      <DialogHead title={PLAN_BUY_TITLE} subtitle={planBuyPackHint(packPrice)} onClose={onClose} />
      <form className="plan-buy-form" onSubmit={submit}>
        <label className="field">
          <span>{PLAN_BUY_PACKS}</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={20}
            step={1}
            value={packsText}
            onChange={(event) => setPacksText(event.target.value)}
          />
        </label>
        {ready ? <p className="b2 t2 num">{buyTotal(packs, packPrice)}</p> : null}
        <p className="c1 t3">{BUY_TERMS}</p>
        {error ? (
          <p className="auth-error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="sheet-actions">
          <button type="button" className="btn sec" onClick={onClose}>
            {PLAN_CANCEL}
          </button>
          <button type="submit" className="btn pri" disabled={!ready || pending}>
            {PLAN_BUY}
          </button>
        </div>
      </form>
    </Dialog>
  )
}

export default BuyDialog
