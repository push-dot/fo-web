import { ApiError, type LedgerEntry } from '@push/api-client'
import { creditText } from './utils/credit-count'
import { MAX_PACKS, PACK_CREDITS, formatKrw } from '../../shared/model/employer-plans'

export const MICRO_PER_CREDIT = 6000

export const PAYMENTS_CLOSED = '결제는 아직 준비 중이에요'

export const PLAN_USAGE_TITLE = '이번 달 사용량'

export const PLAN_USAGE_RESET = '매월 1일에 사용량이 다시 채워져요.'

export const PLAN_BUY_TITLE = '크레딧 구매'

export const PLAN_BUY_HINT = '이번 달 크레딧이 모자라면 더 살 수 있어요'

export const PLAN_BUY = '구매'

export const PLAN_BUY_PACKS = '구매할 팩 수'

export const planBuyPackHint = (packPrice: number) =>
  `1팩에 ${creditText(PACK_CREDITS)}크레딧 · ${formatKrw(packPrice)}이에요. 한 번에 ${MAX_PACKS}팩까지 살 수 있어요.`

export const buyTotal = (packs: number, packPrice: number) =>
  `${creditText(packs * PACK_CREDITS)}크레딧 · ${formatKrw(packs * packPrice)}`

export const BUY_TERMS =
  '크레딧은 한 번만 결제돼요. 자동으로 다시 결제되지 않아요. 결제한 날부터 7일 안에 쓰지 않았다면 환불받을 수 있어요.'

export const PLAN_HISTORY = '결제 내역'

export const PLAN_CLOSE = '닫기'

export const PLAN_CANCEL = '취소'

export const PLAN_CONFIRM_FAILED =
  '결제를 확인하지 못했어요. 결제 내역을 확인하고, 반영되지 않았다면 문의해 주세요.'

export const PLAN_UNSUBSCRIBE_TITLE = '구독을 해지할까요?'

export const planUnsubscribeBody = (date: string | null) =>
  date
    ? `${date}까지는 지금 요금제를 쓸 수 있어요. 그 뒤로는 요금이 나가지 않아요.`
    : '이미 결제한 기간이 끝날 때까지는 지금 요금제를 쓸 수 있어요. 그 뒤로는 요금이 나가지 않아요.'

export const PLAN_UNSUBSCRIBE_CONFIRM = '해지하기'

export const PLAN_UNSUBSCRIBE_KEEP = '계속 쓰기'

export const planConfirmError = (error: unknown) =>
  error instanceof ApiError && error.code === 'PAYMENTS_DISABLED'
    ? PAYMENTS_CLOSED
    : PLAN_CONFIRM_FAILED

export const TOPUP_DONE = '크레딧을 구매했어요'

export const LEDGER_LOADING = '결제 내역을 불러오고 있어요'

export const LEDGER_FAILED = '결제 내역을 불러오지 못했어요'

export const LEDGER_EMPTY = '아직 결제 내역이 없어요'

export const LEDGER_REFUND = '환불'

export const LEDGER_RECEIPT = '영수증'

export const LEDGER_MORE = '더 보기'

export const endsWithVowel = (name: string) => /[aeiouy]$/i.test(name)

export const planPaid = (name?: string) =>
  name
    ? `결제를 마쳤어요. 이제 ${name}${endsWithVowel(name) ? '를' : '을'} 써요`
    : '결제를 마쳤어요'

export const planUsed = (percent: number) => `이번 달 ${percent}% 썼어요`

export const ledgerSubtitle = (company: string, count: number) => `${company} · 최근 ${count}건`

export const ledgerDate = (iso: string) =>
  new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Seoul',
  }).format(new Date(iso))

const usd = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount)

export const ledgerPayments = (rows: readonly LedgerEntry[]) =>
  rows.flatMap(({ id, type, description, amountUsd, receiptUrl, createdAt }) =>
    amountUsd == null
      ? []
      : [
          {
            id,
            createdAt,
            amountUsd,
            receiptUrl,
            title: description ?? (type === 'REFUND' ? LEDGER_REFUND : PLAN_HISTORY),
          },
        ],
  )

export const ledgerNeedsAnotherPage = (paymentCount: number, hasNextPage: boolean) =>
  paymentCount === 0 && hasNextPage

export const ledgerView = ({
  isError,
  isPending,
  isFetchingNextPage,
  isFetchNextPageError,
  hasNextPage,
  paymentCount,
}: {
  isError: boolean
  isPending: boolean
  isFetchingNextPage: boolean
  isFetchNextPageError: boolean
  hasNextPage: boolean
  paymentCount: number
}): 'error' | 'loading' | 'empty' | 'rows' => {
  if (isError || (paymentCount === 0 && isFetchNextPageError)) return 'error'
  if (
    isPending ||
    ledgerNeedsAnotherPage(paymentCount, hasNextPage) ||
    (paymentCount === 0 && isFetchingNextPage)
  )
    return 'loading'
  if (paymentCount === 0) return 'empty'
  return 'rows'
}

export const ledgerShowsMore = (paymentCount: number, hasNextPage: boolean) =>
  paymentCount > 0 && hasNextPage

export const ledgerUsd = (amountUsd: number) =>
  amountUsd < 0 ? `-${usd(-amountUsd)}` : usd(amountUsd)

export const PLAN_ACTION_FAILED = '요금제 변경을 시작하지 못했어요'

export const planActionError = (error: unknown) =>
  error instanceof ApiError && error.code === 'PAYMENTS_DISABLED'
    ? PAYMENTS_CLOSED
    : PLAN_ACTION_FAILED
