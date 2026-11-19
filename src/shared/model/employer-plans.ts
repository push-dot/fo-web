export const EMPLOYER_PLAN_CARDS = [
  { id: 'BASIC', name: 'Basic', credits: '3,000', blurb: '사용량 · 공고 생성 · 서류 검토' },
  { id: 'PRO', name: 'Pro', credits: '15,000', blurb: '사용량 ↑ · 더 깊이 분석 · 면접 준비 · 담당자 2명' },
  { id: 'ULTRA', name: 'Ultra', credits: '30,000', blurb: '사용량 ↑ · 더 깊이 분석 · 외부 PDF · 담당자 5명' },
] as const

export type CheckoutPlanId = (typeof EMPLOYER_PLAN_CARDS)[number]['id']

export const PACK_CREDITS = 1500

export const MAX_PACKS = 20

export type PlanPrices = { BASIC: number; PRO: number; ULTRA: number; pack: number }

export const DEFAULT_PLAN_PRICES: PlanPrices = { BASIC: 29_000, PRO: 140_000, ULTRA: 280_000, pack: 14_000 }

const validPrice = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value) && value > 0

/** The server's KRW prices win; an old server, or one with a bad value, falls back to the list price. */
export const planPrices = (billing: { prices?: Partial<Record<keyof PlanPrices, unknown>> } | undefined): PlanPrices => {
  const sent = billing?.prices
  const pick = (key: keyof PlanPrices) => (validPrice(sent?.[key]) ? sent[key] : DEFAULT_PLAN_PRICES[key])
  return { BASIC: pick('BASIC'), PRO: pick('PRO'), ULTRA: pick('ULTRA'), pack: pick('pack') }
}

export const formatKrw = (amount: number) => `${new Intl.NumberFormat('ko-KR').format(amount)}원`

export const showEmployerCheckout = (audience: 'PERSONAL' | 'EMPLOYER' | undefined): boolean =>
  audience !== 'PERSONAL'

export const canChangeEmployerPlan = (role: 'ADMIN' | 'MEMBER' | undefined, companyMissing: boolean): boolean =>
  role === 'ADMIN' || (companyMissing && role === undefined)

// Servers before push-be #246 send no paymentsEnabled and keep payments open. No billing data at all (loading, error) stays closed.
export const paymentsOpen = (billing: { paymentsEnabled?: boolean } | undefined): boolean =>
  billing !== undefined && billing.paymentsEnabled !== false

// push-be takes 1 to 20 packs of 1,500 credits per top-up.
export const topupReady = (packs: number): boolean => Number.isInteger(packs) && packs >= 1 && packs <= MAX_PACKS

const PLAN_IDS: readonly string[] = EMPLOYER_PLAN_CARDS.map((card) => card.id)

export const isPlanId = (value: string | null): value is CheckoutPlanId => value !== null && PLAN_IDS.includes(value)

export type TossReturn =
  | { kind: 'billing'; authKey: string; customerKey: string; planId: CheckoutPlanId }
  | { kind: 'topup'; paymentKey: string; orderId: string; amount: number }
  | { kind: 'fail'; code: string | null; message: string | null }

const PLANS_PATH = '/employer/plans'

/** Where Toss sends the browser back after card registration (subscribe) and after a payment (top-up). */
export const tossReturnUrls = (origin: string, route: 'billing' | 'topup', planId?: CheckoutPlanId) => {
  const success = new URL(PLANS_PATH, origin)
  success.searchParams.set('toss', route)
  if (planId) success.searchParams.set('planId', planId)
  const fail = new URL(PLANS_PATH, origin)
  fail.searchParams.set('toss', 'fail')
  return { successUrl: success.href, failUrl: fail.href }
}

/** Reads ?toss=billing|topup|fail from the return URL. Anything missing or malformed is ignored, never confirmed. */
export const tossReturn = (params: URLSearchParams): TossReturn | null => {
  const kind = params.get('toss')
  if (kind === 'fail') return { kind, code: params.get('code'), message: params.get('message') }
  if (kind === 'billing') {
    const authKey = params.get('authKey')
    const customerKey = params.get('customerKey')
    const planId = params.get('planId')
    return authKey && customerKey && isPlanId(planId) ? { kind, authKey, customerKey, planId } : null
  }
  if (kind === 'topup') {
    const paymentKey = params.get('paymentKey')
    const orderId = params.get('orderId')
    const amount = Number(params.get('amount'))
    return paymentKey && orderId && Number.isInteger(amount) && amount > 0 ? { kind, paymentKey, orderId, amount } : null
  }
  return null
}

export const TOSS_RETURN_PARAMS = ['toss', 'planId', 'authKey', 'customerKey', 'paymentKey', 'orderId', 'amount', 'paymentType', 'code', 'message'] as const
