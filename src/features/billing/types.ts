import type { CheckoutPlanId } from './utils/employer-plans'

export type TossSettled = { kind: 'billing'; planId: CheckoutPlanId } | { kind: 'topup' }
