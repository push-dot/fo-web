import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { billingLedger } from '../../../shared/api/operations'
import { paymentsOpen } from '../utils/employer-plans'
import { billingCompanyStatus } from './fetchers'

export const useCompanyBilling = () =>
  useQuery({ queryKey: ['billing', 'company'], queryFn: () => billingCompanyStatus() })

export const usePaymentsOpen = () => paymentsOpen(useCompanyBilling().data)

export const useBillingLedger = () =>
  useInfiniteQuery({
    queryKey: ['billing', 'ledger'],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => billingLedger({ cursor: pageParam }),
    getNextPageParam: (last) =>
      last.page.hasMore ? (last.page.nextCursor ?? undefined) : undefined,
  })
