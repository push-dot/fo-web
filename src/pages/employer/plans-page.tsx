import { ApiError, type EmployerPlan } from '@push/api-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import {
  EMPLOYER_PLAN_CARDS,
  canChangeEmployerPlan,
  paymentsOpen,
  planPrices,
  showEmployerCheckout,
} from '../../shared/model/employer-plans'
import {
  PAYMENTS_CLOSED,
  PLAN_BLURB,
  PLAN_FEATURES,
  PLAN_LEAD,
  PLAN_MANAGE_TITLE,
  PLAN_NOTE,
  PLAN_PAY_FAILED_TITLE,
  PLAN_SECURE,
  PLAN_TERMS,
  PLAN_TERMS_TITLE,
  PLAN_UNSUBSCRIBE,
  PLAN_UNSUBSCRIBE_DONE,
  PLAN_UNSUBSCRIBE_FAILED,
  PLAN_VIEWER_TITLE,
  PLANS_LOADING,
  PLANS_PERSONAL,
  PLANS_TITLE,
  ledgerDate,
  planActionError,
  planEndsOn,
  planMonthly,
  planPayFailedBody,
  planRenews,
  planSwitchLabel,
  planUsedPercent,
  planViewerBody,
} from './constants'
import MySide from '../my/my-side'
import PlanCard from './plan-card'
import PlanUsage from './plan-usage'
import useTossReturn from './use-toss-return'
import { BuyDialog, CancelDialog, LedgerDialog } from './plan-dialogs'
import { useCompanyBilling } from '../../entities/billing'
import { useMyCompany } from '../../entities/company'
import { useCompanyMembers } from '../../entities/member'
import { buyCreditPacks, cancelSubscription, subscribeToPlan, tossClientKey } from '../../features/checkout-plan'
import Toast, { useToast } from '../../shared/ui/toast'
import { Icon } from '../../shared/ui/icon'

const companyMissing = (error: unknown) => error instanceof ApiError && error.status === 404

const PlanBanner = ({ title, body }: { title: string; body: string }) => (
  <div className="plan-banner" role="status">
    <Icon name="info" size={20} />
    <div>
      <p className="b2 w7">{title}</p>
      <p className="c1 t2">{body}</p>
    </div>
  </div>
)

const userCanceled = (error: unknown) => typeof error === 'object' && error !== null && 'code' in error && error.code === 'USER_CANCEL'

const PlansPage = () => {
  const queryClient = useQueryClient()
  const [actionError, setActionError] = useState<string | null>(null)
  const [dialog, setDialog] = useState<'buy' | 'history' | 'cancel' | null>(null)
  const toast = useToast()
  const back = useTossReturn(toast.show)
  const billing = useCompanyBilling()
  const company = useMyCompany({
    retry: (failureCount, error) => !companyMissing(error) && failureCount < 1,
  })
  const viewer = company.data?.role === 'MEMBER'
  const members = useCompanyMembers({ enabled: viewer })
  const failPay = (error: unknown) => {
    if (!userCanceled(error)) setActionError(planActionError(error))
  }
  const checkout = useMutation({
    mutationFn: (planId: EmployerPlan) => subscribeToPlan(planId),
    onError: failPay,
  })
  const topup = useMutation({
    mutationFn: (packs: number) => buyCreditPacks(packs),
    onSuccess: () => setDialog(null),
    onError: failPay,
  })
  const unsubscribe = useMutation({
    mutationFn: cancelSubscription,
    onSuccess: async () => {
      setDialog(null)
      await queryClient.invalidateQueries({ queryKey: ['billing'] })
      toast.show(PLAN_UNSUBSCRIBE_DONE)
    },
    onError: () => setActionError(PLAN_UNSUBSCRIBE_FAILED),
  })
  const billingReady = billing.isSuccess || billing.isError
  const employerPlans = billingReady && showEmployerCheckout(billing.data?.audience)
  const companyReady = company.isSuccess || company.isError
  if (!billingReady || (employerPlans && !companyReady)) {
    return (
      <main className="page my-layout" aria-busy="true">
        <MySide />
        <p className="b2 t3">{PLANS_LOADING}</p>
      </main>
    )
  }
  if (!employerPlans) {
    return (
      <main className="page my-layout">
        <MySide />
        <div className="my-main">
          <h1 className="h1">{PLANS_TITLE}</h1>
          <p className="b1">{PLANS_PERSONAL}</p>
        </div>
      </main>
    )
  }
  const missing = companyMissing(company.error)
  const canManage = canChangeEmployerPlan(company.data?.role, missing)
  const open = paymentsOpen(billing.data) && tossClientKey() !== undefined
  const canPay = canManage && open
  const subscribe = (planId: EmployerPlan) => {
    if (!canPay || checkout.isPending) return
    setActionError(null)
    back.clear()
    checkout.mutate(planId)
  }
  const currentPlan = billing.data?.plan ?? null
  const rank = { BASIC: 0, PRO: 1, ULTRA: 2 } as const
  const percent = planUsedPercent(billing.data?.spentMicroCredits ?? 0, billing.data?.monthlyMicroCredits ?? 0)
  const admin = members.data?.find((member) => member.role === 'ADMIN')
  const prices = planPrices(billing.data)
  const managed = billing.data?.provider === 'toss' && currentPlan !== null
  const canceled = billing.data?.canceled === true
  const periodEnd = billing.data?.periodEndsAt ? ledgerDate(billing.data.periodEndsAt) : null
  const renews = billing.data?.renewsAt ? ledgerDate(billing.data.renewsAt) : periodEnd
  return (
    <main className="page my-layout">
      <MySide />
      <div className="my-main plan-main">
        <h1 className="h1">{PLANS_TITLE}</h1>
        {back.failed ? <PlanBanner title={PLAN_PAY_FAILED_TITLE} body={planPayFailedBody(back.failed.code, back.failed.message)} /> : null}
        {back.confirmError ? (
          <p className="auth-error" role="alert">
            {back.confirmError}
          </p>
        ) : null}
        {viewer ? <PlanBanner title={PLAN_VIEWER_TITLE} body={planViewerBody(admin?.displayName)} /> : null}
        {billing.data && !open ? (
          <p className="b1" role="status">
            {PAYMENTS_CLOSED}
          </p>
        ) : null}
        <PlanUsage
          percent={percent}
          buy={open ? (canPay ? 'on' : 'off') : 'hidden'}
          onHistory={() => setDialog('history')}
          onBuy={() => {
            setActionError(null)
            setDialog('buy')
          }}
        />
        <h2 className="h2 plan-lead">{PLAN_LEAD}</h2>
        <ul className="plan-grid">
          {EMPLOYER_PLAN_CARDS.map((card) => (
            <PlanCard
              key={card.id}
              name={card.name}
              price={planMonthly(prices[card.id])}
              blurb={PLAN_BLURB[card.id]}
              features={PLAN_FEATURES[card.id]}
              featured={card.id === 'ULTRA'}
              current={card.id === currentPlan}
              action={planSwitchLabel(card.name, card.id === currentPlan, currentPlan ? rank[card.id] > rank[currentPlan] : false, currentPlan !== null)}
              disabled={!canPay || checkout.isPending}
              onSubscribe={() => subscribe(card.id)}
            />
          ))}
        </ul>
        {actionError && dialog !== 'buy' ? (
          <p className="auth-error" role="alert">
            {actionError}
          </p>
        ) : null}
        <section className="plan-banner plan-terms" aria-label={PLAN_TERMS_TITLE}>
          <Icon name="info" size={20} />
          <div>
            <p className="b2 w7">{PLAN_TERMS_TITLE}</p>
            <ul className="c1 t2">
              {PLAN_TERMS.map((term) => (
                <li key={term}>{term}</li>
              ))}
            </ul>
          </div>
        </section>
        {managed ? (
          <section className="box plan-usage" aria-label={PLAN_MANAGE_TITLE}>
            <div className="plan-buy">
              <div className="plan-buy-copy">
                <h2 className="b1 w7">{PLAN_MANAGE_TITLE}</h2>
                <p className="c1 t3">{canceled ? (periodEnd ? planEndsOn(periodEnd) : null) : renews ? planRenews(renews) : null}</p>
              </div>
              {canceled || !canManage ? null : (
                <button
                  type="button"
                  className="btn sec sm"
                  onClick={() => {
                    setActionError(null)
                    setDialog('cancel')
                  }}
                >
                  {PLAN_UNSUBSCRIBE}
                </button>
              )}
            </div>
          </section>
        ) : null}
        <p className="c1 t3">{PLAN_NOTE}</p>
        <p className="c1 t3 plan-secure">
          <Icon name="lock" size={14} />
          {PLAN_SECURE}
        </p>
      </div>
      {dialog === 'history' ? <LedgerDialog company={company.data?.name ?? ''} onClose={() => setDialog(null)} /> : null}
      {dialog === 'buy' && canPay ? (
        <BuyDialog
          packPrice={prices.pack}
          pending={topup.isPending}
          error={actionError}
          onSubmit={(packs) => {
            setActionError(null)
            back.clear()
            topup.mutate(packs)
          }}
          onClose={() => setDialog(null)}
        />
      ) : null}
      {dialog === 'cancel' && canManage ? (
        <CancelDialog endsOn={renews} pending={unsubscribe.isPending} error={actionError} onConfirm={() => unsubscribe.mutate()} onClose={() => setDialog(null)} />
      ) : null}
      <Toast message={toast.message} tone={toast.tone} action={toast.action} />
    </main>
  )
}

export default PlansPage
