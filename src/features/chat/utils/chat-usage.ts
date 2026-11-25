import type { BillingStatus } from '@push/api-client'

export const usedPercent = (
  billing: Pick<BillingStatus, 'monthlyMicroCredits' | 'spentMicroCredits' | 'balanceMicroCredits'>,
) => {
  const {
    monthlyMicroCredits: monthly,
    spentMicroCredits: spent,
    balanceMicroCredits: balance,
  } = billing
  if (balance <= 0) return 100
  if (monthly <= 0) return 0
  return Math.max(0, Math.min(100, Math.round((spent / monthly) * 100)))
}
