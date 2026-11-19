import { describe, expect, it } from 'vitest'
import { DEFAULT_PLAN_PRICES, EMPLOYER_PLAN_CARDS, canChangeEmployerPlan, formatKrw, paymentsOpen, planPrices, showEmployerCheckout, tossReturn, tossReturnUrls, topupReady } from './employer-plans'

const FORBIDDEN_MODEL_NAMES = ['Sonnet', 'Opus', 'Fable']

describe('employer plan cards', () => {
  it('lists Basic, Pro and Ultra with their credits', () => {
    expect(EMPLOYER_PLAN_CARDS).toEqual([
      { id: 'BASIC', name: 'Basic', credits: '3,000', blurb: '사용량 · 공고 생성 · 서류 검토' },
      { id: 'PRO', name: 'Pro', credits: '15,000', blurb: '사용량 ↑ · 더 깊이 분석 · 면접 준비 · 담당자 2명' },
      { id: 'ULTRA', name: 'Ultra', credits: '30,000', blurb: '사용량 ↑ · 더 깊이 분석 · 외부 PDF · 담당자 5명' },
    ])
  })

  it('names two seats on Pro and five seats on Ultra', () => {
    expect(EMPLOYER_PLAN_CARDS.find((card) => card.id === 'PRO')?.blurb).toContain('담당자 2명')
    expect(EMPLOYER_PLAN_CARDS.find((card) => card.id === 'ULTRA')?.blurb).toContain('담당자 5명')
  })

  it('keeps model names out of every blurb', () => {
    for (const card of EMPLOYER_PLAN_CARDS) {
      for (const name of FORBIDDEN_MODEL_NAMES) {
        expect(card.blurb.includes(name)).toBe(false)
      }
    }
  })
})

describe('canChangeEmployerPlan', () => {
  it('lets an admin or a missing company change the plan, and blocks a member', () => {
    expect(canChangeEmployerPlan('ADMIN', false)).toBe(true)
    expect(canChangeEmployerPlan(undefined, true)).toBe(true)
    expect(canChangeEmployerPlan('MEMBER', false)).toBe(false)
    expect(canChangeEmployerPlan(undefined, false)).toBe(false)
  })
})

describe('topupReady', () => {
  it('accepts a whole number of packs from 1 to 20', () => {
    expect(topupReady(1)).toBe(true)
    expect(topupReady(20)).toBe(true)
    expect(topupReady(21)).toBe(false)
    expect(topupReady(0.5)).toBe(false)
    expect(topupReady(0)).toBe(false)
    expect(topupReady(-1)).toBe(false)
    expect(topupReady(Number.NaN)).toBe(false)
    expect(topupReady(Number.POSITIVE_INFINITY)).toBe(false)
  })
})

describe('showEmployerCheckout', () => {
  it('hides checkout for a personal audience', () => {
    expect(showEmployerCheckout('PERSONAL')).toBe(false)
  })

  it('shows checkout for an employer audience and when audience is missing', () => {
    expect(showEmployerCheckout('EMPLOYER')).toBe(true)
    expect(showEmployerCheckout(undefined)).toBe(true)
  })
})

describe('paymentsOpen', () => {
  it('closes checkout and top-up when the server reports payments off', () => {
    expect(paymentsOpen({ paymentsEnabled: false })).toBe(false)
  })

  it('keeps them open when the server allows payments or predates the flag', () => {
    expect(paymentsOpen({ paymentsEnabled: true })).toBe(true)
    expect(paymentsOpen({})).toBe(true)
  })

  it('keeps them closed until billing loads', () => {
    expect(paymentsOpen(undefined)).toBe(false)
  })
})


describe('KRW prices', () => {
  it('lists Basic at 29,000원, Pro at 140,000원, Ultra at 280,000원 and a pack at 14,000원', () => {
    expect(DEFAULT_PLAN_PRICES).toEqual({ BASIC: 29_000, PRO: 140_000, ULTRA: 280_000, pack: 14_000 })
  })

  it('formats whole won with thousands separators', () => {
    expect(formatKrw(29_000)).toBe('29,000원')
    expect(formatKrw(280_000)).toBe('280,000원')
    expect(formatKrw(0)).toBe('0원')
  })

  it('prefers the server prices and falls back per field', () => {
    expect(planPrices(undefined)).toEqual(DEFAULT_PLAN_PRICES)
    expect(planPrices({})).toEqual(DEFAULT_PLAN_PRICES)
    expect(planPrices({ prices: { BASIC: 30_000, PRO: 150_000, ULTRA: 300_000, pack: 15_000 } })).toEqual({ BASIC: 30_000, PRO: 150_000, ULTRA: 300_000, pack: 15_000 })
    expect(planPrices({ prices: { BASIC: 30_000, PRO: -1, ULTRA: 'x', pack: 1.5 } })).toEqual({ ...DEFAULT_PLAN_PRICES, BASIC: 30_000 })
  })
})

describe('Toss return URLs', () => {
  it('sends the subscription back with the plan, and failures to ?toss=fail', () => {
    expect(tossReturnUrls('https://push.example', 'billing', 'PRO')).toEqual({
      successUrl: 'https://push.example/employer/plans?toss=billing&planId=PRO',
      failUrl: 'https://push.example/employer/plans?toss=fail',
    })
  })

  it('sends a top-up back without a plan', () => {
    expect(tossReturnUrls('https://push.example', 'topup').successUrl).toBe('https://push.example/employer/plans?toss=topup')
  })
})

describe('tossReturn', () => {
  const of = (search: string) => tossReturn(new URL(`https://push.example/employer/plans${search}`).searchParams)

  it('reads a card registration with authKey and customerKey', () => {
    expect(of('?toss=billing&planId=PRO&customerKey=ck_1&authKey=ak_1')).toEqual({ kind: 'billing', authKey: 'ak_1', customerKey: 'ck_1', planId: 'PRO' })
  })

  it('ignores a registration that lacks a key or names an unknown plan', () => {
    expect(of('?toss=billing&planId=PRO&customerKey=ck_1')).toBeNull()
    expect(of('?toss=billing&planId=PRO&authKey=ak_1')).toBeNull()
    expect(of('?toss=billing&planId=FREE&customerKey=ck_1&authKey=ak_1')).toBeNull()
    expect(of('?toss=billing&customerKey=ck_1&authKey=ak_1')).toBeNull()
  })

  it('reads a top-up payment with its paymentKey, orderId and amount', () => {
    expect(of('?toss=topup&paymentType=NORMAL&orderId=o_1&paymentKey=pk_1&amount=14000')).toEqual({ kind: 'topup', paymentKey: 'pk_1', orderId: 'o_1', amount: 14_000 })
  })

  it('ignores a top-up with a missing or bad amount', () => {
    expect(of('?toss=topup&orderId=o_1&paymentKey=pk_1')).toBeNull()
    expect(of('?toss=topup&orderId=o_1&paymentKey=pk_1&amount=abc')).toBeNull()
    expect(of('?toss=topup&orderId=o_1&paymentKey=pk_1&amount=0')).toBeNull()
    expect(of('?toss=topup&orderId=o_1&amount=14000')).toBeNull()
  })

  it('reads a failure with its code and message', () => {
    expect(of('?toss=fail&code=PAY_PROCESS_CANCELED&message=%EC%B7%A8%EC%86%8C&orderId=o_1')).toEqual({ kind: 'fail', code: 'PAY_PROCESS_CANCELED', message: '취소' })
    expect(of('?toss=fail')).toEqual({ kind: 'fail', code: null, message: null })
  })

  it('ignores a plain page load and the old Stripe return', () => {
    expect(of('')).toBeNull()
    expect(of('?toss=other')).toBeNull()
    expect(of('?checkout=success&session_id=cs_1')).toBeNull()
  })
})
