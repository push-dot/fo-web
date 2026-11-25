import { readFileSync } from 'node:fs'
import type { Company, CompanyBillingStatus } from '@push/api-client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import PlansPage from './plans-page'
import { PAYMENTS_CLOSED, PLAN_TERMS, PLAN_UNSUBSCRIBE, PLAN_VIEWER_TITLE } from './constants'

const billing = (paymentsEnabled?: boolean, extra: Partial<CompanyBillingStatus> = {}): CompanyBillingStatus => ({
  plan: 'PRO',
  audience: 'EMPLOYER',
  balanceMicroCredits: 5_160_000,
  subscriptionStatus: 'active',
  periodEndsAt: '2026-11-01T00:00:00.000Z',
  reservedMicroCredits: 0,
  monthlyMicroCredits: 15_000_000,
  spentMicroCredits: 9_840_000,
  ...(paymentsEnabled === undefined ? {} : { paymentsEnabled }),
  ...extra,
})

const company = (role: Company['role']): Company => ({
  id: 'co-1',
  bNo: '2148703921',
  name: '모아페이',
  plan: 'PRO',
  verifiedAt: '2026-09-01T00:00:00.000Z',
  role,
  seats: { used: 1, limit: 2 },
})

const render = (role: Company['role'], paymentsEnabled?: boolean, extra?: Partial<CompanyBillingStatus>) => {
  const client = new QueryClient()
  client.setQueryData(['billing', 'company'], billing(paymentsEnabled, extra))
  client.setQueryData(['company', 'me'], company(role))
  client.setQueryData(['company', 'members'], [])
  return renderToStaticMarkup(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/employer/plans']}>
        <PlansPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

const button = (html: string, label: string) =>
  html.match(new RegExp(`<button[^>]*>(?:(?!</button>).)*${label}</button>`))?.[0]

describe('plans page canPay = canManage && paymentsOpen', () => {
  beforeEach(() => vi.stubEnv('VITE_TOSS_CLIENT_KEY', 'test_ck_placeholder'))
  afterEach(() => vi.unstubAllEnvs())

  it('lets an admin buy and switch while payments are open', () => {
    const html = render('ADMIN', true)
    expect(button(html, '구매')).not.toContain('disabled')
    expect(button(html, 'Ultra로 올리기')).not.toContain('disabled')
    expect(html).not.toContain(PAYMENTS_CLOSED)
  })

  it('keeps an old server without paymentsEnabled open', () => {
    expect(button(render('ADMIN'), '구매')).not.toContain('disabled')
  })

  it('hides 구매, disables the plan buttons and says why when payments are closed', () => {
    const html = render('ADMIN', false)
    expect(button(html, '구매')).toBeUndefined()
    expect(button(html, 'Ultra로 올리기')).toContain('disabled')
    expect(html).toContain(PAYMENTS_CLOSED)
  })

  it('shows KRW prices as 월 29,000원 and never a dollar sign', () => {
    const html = render('ADMIN', true)
    expect(html).toContain('월 29,000원')
    expect(html).toContain('월 140,000원')
    expect(html).toContain('월 280,000원')
    expect(html).not.toContain('$')
    expect(html).not.toContain('Stripe')
  })

  it('shows the server prices when billing sends them', () => {
    const html = render('ADMIN', true, { currency: 'KRW', prices: { BASIC: 30_000, PRO: 150_000, ULTRA: 300_000, pack: 15_000 } })
    expect(html).toContain('월 30,000원')
    expect(html).not.toContain('월 29,000원')
  })

  it('states auto renewal, how to cancel and the 7-day limit before any payment button', () => {
    const html = render('ADMIN', true)
    for (const term of PLAN_TERMS) expect(html).toContain(term)
    expect(html.indexOf(PLAN_TERMS[0])).toBeGreaterThan(html.indexOf('구독하기'))
  })

  it('closes payments when no Toss client key is set', () => {
    vi.stubEnv('VITE_TOSS_CLIENT_KEY', '')
    const html = render('ADMIN', true)
    expect(html).toContain(PAYMENTS_CLOSED)
    expect(button(html, 'Ultra로 올리기')).toContain('disabled')
  })

  it('offers 구독 해지 to an admin on a Toss subscription, and a date once canceled', () => {
    const toss = { provider: 'toss' as const, renewsAt: '2026-12-01T00:00:00.000Z' }
    expect(button(render('ADMIN', true, toss), PLAN_UNSUBSCRIBE)).toBeDefined()
    expect(render('ADMIN', true, toss)).toContain('2026년 12월 1일에 자동으로 결제돼요')
    expect(button(render('MEMBER', true, toss), PLAN_UNSUBSCRIBE)).toBeUndefined()
    const canceled = render('ADMIN', true, { ...toss, canceled: true, periodEndsAt: '2026-12-01T00:00:00.000Z' })
    expect(button(canceled, PLAN_UNSUBSCRIBE)).toBeUndefined()
    expect(canceled).toContain('해지했어요. 2026년 12월 1일까지 쓸 수 있어요')
  })

  it('shows a member the disabled actions and the admin-only banner', () => {
    const html = render('MEMBER', true)
    expect(button(html, '구매')).toContain('disabled')
    expect(button(html, 'Ultra로 올리기')).toContain('disabled')
    expect(html).toContain(PLAN_VIEWER_TITLE)
    expect(button(html, '결제 내역')).not.toContain('disabled')
  })
})
