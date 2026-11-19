import {
  billingTossAuth,
  billingTossCancel,
  billingTossConfirm,
  billingTossTopup,
  billingTossTopupConfirm,
} from '../../shared/api/operations'
import type { CheckoutPlanId, TossReturn } from '../../shared/model/employer-plans'
import { tossClientKey } from './toss-client-key'
import { requestTossBillingAuth, requestTossTopupPayment } from './toss-payments'

export { tossClientKey }

export const subscribeToPlan = async (planId: CheckoutPlanId) => {
  const auth = await billingTossAuth(planId)
  await requestTossBillingAuth(auth.customerKey, planId)
}

export const buyCreditPacks = async (packs: number) => {
  const order = await billingTossTopup(packs)
  await requestTossTopupPayment(order)
}

export type TossSettled = { kind: 'billing'; planId: CheckoutPlanId } | { kind: 'topup' }

export const settleTossReturn = async (back: Exclude<TossReturn, { kind: 'fail' }>): Promise<TossSettled> => {
  if (back.kind === 'billing') {
    await billingTossConfirm({ authKey: back.authKey, customerKey: back.customerKey, planId: back.planId })
    return { kind: 'billing', planId: back.planId }
  }
  await billingTossTopupConfirm({ paymentKey: back.paymentKey, orderId: back.orderId, amount: back.amount })
  return { kind: 'topup' }
}

export const cancelSubscription = () => billingTossCancel()
