import {
  billingCompanyStatus as fetchCompanyBilling,
  billingTossAuth,
  billingTossCancel,
  billingTossConfirm,
  billingTossTopup,
  billingTossTopupConfirm,
} from '../../../shared/api/operations'
import {
  type CheckoutPlanId,
  type TossReturn,
  tossReturnUrls,
} from '../utils/employer-plans'
import { tossClientKey } from '../utils/toss-client-key'
import type { TossSettled } from '../types'
import { loadTossPayments } from '@tosspayments/tosspayments-sdk'
import type { TossTopupOrder } from '@push/api-client'

export const billingCompanyStatus = (...args: Parameters<typeof fetchCompanyBilling>) =>
  fetchCompanyBilling(...args)

export { tossClientKey }

export const subscribeToPlan = async (planId: CheckoutPlanId) => {
  const auth = await billingTossAuth(planId)
  await requestTossBillingAuth(auth.customerKey, planId)
}

export const buyCreditPacks = async (packs: number) => {
  const order = await billingTossTopup(packs)
  await requestTossTopupPayment(order)
}

export const settleTossReturn = async (
  back: Exclude<TossReturn, { kind: 'fail' }>,
): Promise<TossSettled> => {
  if (back.kind === 'billing') {
    await billingTossConfirm({
      authKey: back.authKey,
      customerKey: back.customerKey,
      planId: back.planId,
    })
    return { kind: 'billing', planId: back.planId }
  }
  await billingTossTopupConfirm({
    paymentKey: back.paymentKey,
    orderId: back.orderId,
    amount: back.amount,
  })
  return { kind: 'topup' }
}

export const cancelSubscription = () => billingTossCancel()

const payment = async (customerKey: string) => {
  const clientKey = tossClientKey()
  if (!clientKey) throw new Error('VITE_TOSS_CLIENT_KEY is not set')
  const toss = await loadTossPayments(clientKey)
  return toss.payment({ customerKey })
}

export const requestTossBillingAuth = async (customerKey: string, planId: CheckoutPlanId) => {
  const sdk = await payment(customerKey)
  await sdk.requestBillingAuth({
    method: 'CARD',
    windowTarget: 'self',
    ...tossReturnUrls(window.location.origin, 'billing', planId),
  })
}

export const requestTossTopupPayment = async ({
  customerKey,
  orderId,
  orderName,
  amount,
}: TossTopupOrder) => {
  const sdk = await payment(customerKey)
  await sdk.requestPayment({
    method: 'CARD',
    windowTarget: 'self',
    amount: { currency: 'KRW', value: amount },
    orderId,
    orderName,
    ...tossReturnUrls(window.location.origin, 'topup'),
  })
}
