import type { CheckoutPlanId } from '../../shared/model/employer-plans'

export type TossSettled = { kind: 'billing'; planId: CheckoutPlanId } | { kind: 'topup' }
