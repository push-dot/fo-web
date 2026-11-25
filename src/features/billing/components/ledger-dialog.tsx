import { useEffect } from 'react'
import { useBillingLedger } from '../api/hooks'
import Dialog from '../../../shared/ui/dialog'
import Icon from '../../../shared/ui/icon'
import ErrorState from '../../../shared/ui/error-state'
import {
  LEDGER_EMPTY,
  LEDGER_FAILED,
  LEDGER_LOADING,
  LEDGER_MORE,
  LEDGER_RECEIPT,
  ledgerNeedsAnotherPage,
  ledgerShowsMore,
  ledgerView,
  PLAN_CLOSE,
  PLAN_HISTORY,
  ledgerDate,
  ledgerPayments,
  ledgerSubtitle,
  ledgerUsd,
} from '../constants'
import DialogHead from './dialog-head'

const LedgerDialog = ({ company, onClose }: { company: string; onClose: () => void }) => {
  const ledger = useBillingLedger()
  const rows = ledgerPayments(ledger.data?.pages.flatMap((page) => page.data) ?? [])
  const hasNextPage = Boolean(ledger.hasNextPage)
  const view = ledgerView({
    isError: ledger.isError,
    isPending: ledger.isPending,
    isFetchingNextPage: ledger.isFetchingNextPage,
    isFetchNextPageError: ledger.isFetchNextPageError,
    hasNextPage,
    paymentCount: rows.length,
  })
  useEffect(() => {
    if (!ledger.isSuccess || ledger.isFetchingNextPage || ledger.isFetchNextPageError) return
    if (ledgerNeedsAnotherPage(rows.length, hasNextPage)) void ledger.fetchNextPage()
  }, [
    hasNextPage,
    ledger.isSuccess,
    ledger.isFetchingNextPage,
    ledger.isFetchNextPageError,
    ledger.fetchNextPage,
    rows.length,
  ])
  return (
    <Dialog label={PLAN_HISTORY} onClose={onClose} wide className="plan-dialog">
      <DialogHead
        title={PLAN_HISTORY}
        subtitle={view === 'rows' ? ledgerSubtitle(company, rows.length) : undefined}
        onClose={onClose}
      />
      {view === 'error' ? (
        <ErrorState title={LEDGER_FAILED} onRetry={() => void ledger.refetch()} />
      ) : view === 'loading' ? (
        <p className="b2 t3">{LEDGER_LOADING}</p>
      ) : view === 'empty' ? (
        <p className="b2 t3">{LEDGER_EMPTY}</p>
      ) : (
        <ul className="plan-ledger">
          {rows.map((row) => (
            <li key={row.id}>
              <div className="plan-ledger-copy">
                <p className="b2 w7">{row.title}</p>
                <p className="c1 t3">{ledgerDate(row.createdAt)}</p>
              </div>
              <span className="b2 w7 num">{ledgerUsd(row.amountUsd)}</span>
              {row.receiptUrl?.startsWith('https://') ? (
                <a
                  className="c1 w6 plan-receipt"
                  href={row.receiptUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {LEDGER_RECEIPT}
                  <Icon name="ext" size={14} />
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      {ledgerShowsMore(rows.length, hasNextPage) ? (
        <button
          type="button"
          className="btn sec sm"
          disabled={ledger.isFetchingNextPage}
          onClick={() => void ledger.fetchNextPage()}
        >
          {LEDGER_MORE}
        </button>
      ) : null}
      <div className="sheet-actions">
        <button type="button" className="btn sec" onClick={onClose}>
          {PLAN_CLOSE}
        </button>
      </div>
    </Dialog>
  )
}

export default LedgerDialog
