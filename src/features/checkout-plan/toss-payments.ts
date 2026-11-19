import { loadTossPayments } from '@tosspayments/tosspayments-sdk'
import type { TossTopupOrder } from '@push/api-client'

import { tossReturnUrls, type CheckoutPlanId } from '../../shared/model/employer-plans'
import { tossClientKey } from './toss-client-key'

const payment = async (customerKey: string) => {
  const clientKey = tossClientKey()
  if (!clientKey) throw new Error('VITE_TOSS_CLIENT_KEY is not set')
  const toss = await loadTossPayments(clientKey)
  return toss.payment({ customerKey })
}

/** Opens the Toss card registration. The browser leaves this page and comes back to successUrl or failUrl. */
export const requestTossBillingAuth = async (customerKey: string, planId: CheckoutPlanId) => {
  const sdk = await payment(customerKey)
  await sdk.requestBillingAuth({ method: 'CARD', windowTarget: 'self', ...tossReturnUrls(window.location.origin, 'billing', planId) })
}

export const requestTossTopupPayment = async ({ customerKey, orderId, orderName, amount }: TossTopupOrder) => {
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
