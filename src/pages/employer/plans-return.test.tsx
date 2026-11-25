// @vitest-environment happy-dom
import type { CompanyBillingStatus } from '@push/api-client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { PLAN_CONFIRM_FAILED, TOPUP_DONE, planPaid } from '../../features/billing'
import { PLAN_PAY_FAILED_TITLE } from './constants'
import PlansPage from './plans-page'

const operations = vi.hoisted(() => ({
  billingCompanyStatus: vi.fn(),
  billingTossConfirm: vi.fn(),
  billingTossTopupConfirm: vi.fn(),
}))

vi.mock('../../shared/api/operations', async () => ({
  ...(await vi.importActual<typeof import('../../shared/api/operations')>('../../shared/api/operations')),
  ...operations,
  companiesMe: async () => {
    const { ApiError } = await import('@push/api-client')
    throw new ApiError('no company', 'NOT_FOUND', 404)
  },
  companiesMembers: async () => [],
}))

const status: CompanyBillingStatus = {
  plan: 'PRO',
  audience: 'EMPLOYER',
  balanceMicroCredits: 1,
  subscriptionStatus: 'active',
  periodEndsAt: null,
  reservedMicroCredits: 0,
  monthlyMicroCredits: 15_000_000,
  spentMicroCredits: 0,
  paymentsEnabled: true,
}

const Where = () => <output data-testid="search">{useLocation().search}</output>

const mount = async (entry: string) => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  await act(async () => {
    root.render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[entry]}>
          <PlansPage />
          <Where />
        </MemoryRouter>
      </QueryClientProvider>,
    )
  })
  for (let attempt = 0; attempt < 10; attempt += 1) await act(async () => await new Promise((resolve) => setTimeout(resolve, 10)))
  return { container, root }
}

describe('plans page return from Toss', () => {
  let mounted: { container: HTMLElement; root: Root } | undefined
  beforeEach(() => {
    vi.stubEnv('VITE_TOSS_CLIENT_KEY', 'test_ck_placeholder')
    operations.billingCompanyStatus.mockResolvedValue(status)
  })
  afterEach(() => {
    act(() => mounted?.root.unmount())
    mounted?.container.remove()
    vi.unstubAllEnvs()
    vi.clearAllMocks()
  })

  it('confirms a card registration once, toasts the paid plan and strips the params', async () => {
    operations.billingTossConfirm.mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20))
      return { plan: 'PRO', amount: 140_000, receiptUrl: null }
    })
    mounted = await mount('/employer/plans?toss=billing&planId=PRO&customerKey=ck_1&authKey=ak_1')
    expect(operations.billingTossConfirm).toHaveBeenCalledTimes(1)
    expect(operations.billingTossConfirm).toHaveBeenCalledWith({ authKey: 'ak_1', customerKey: 'ck_1', planId: 'PRO' })
    expect(mounted.container.textContent).toContain(planPaid('Pro'))
    expect(mounted.container.querySelector('[data-testid=search]')?.textContent).toBe('')
    expect(operations.billingCompanyStatus.mock.calls.length).toBeGreaterThan(1)
  })

  it('confirms a top-up with the amount from the return URL', async () => {
    operations.billingTossTopupConfirm.mockResolvedValue({ creditsAdded: 1500, receiptUrl: null })
    mounted = await mount('/employer/plans?toss=topup&orderId=o_1&paymentKey=pk_1&amount=14000&paymentType=NORMAL')
    expect(operations.billingTossTopupConfirm).toHaveBeenCalledTimes(1)
    expect(operations.billingTossTopupConfirm).toHaveBeenCalledWith({ paymentKey: 'pk_1', orderId: 'o_1', amount: 14_000 })
    expect(mounted.container.textContent).toContain(TOPUP_DONE)
  })

  it('shows the code and message of a failed payment without confirming anything', async () => {
    mounted = await mount('/employer/plans?toss=fail&code=PAY_PROCESS_CANCELED&message=%EA%B2%B0%EC%A0%9C%20%EC%B7%A8%EC%86%8C')
    expect(operations.billingTossConfirm).not.toHaveBeenCalled()
    expect(operations.billingTossTopupConfirm).not.toHaveBeenCalled()
    expect(mounted.container.textContent).toContain(PLAN_PAY_FAILED_TITLE)
    expect(mounted.container.textContent).toContain('결제 취소 (PAY_PROCESS_CANCELED)')
    expect(mounted.container.querySelector('[data-testid=search]')?.textContent).toBe('')
  })

  it('says so when the server refuses the confirmation', async () => {
    operations.billingTossConfirm.mockRejectedValue(new Error('refused'))
    mounted = await mount('/employer/plans?toss=billing&planId=PRO&customerKey=ck_1&authKey=ak_1')
    expect(mounted.container.textContent).toContain(PLAN_CONFIRM_FAILED)
  })

  it('does not confirm a return that lacks its keys', async () => {
    mounted = await mount('/employer/plans?toss=billing&planId=PRO')
    expect(operations.billingTossConfirm).not.toHaveBeenCalled()
  })
})
