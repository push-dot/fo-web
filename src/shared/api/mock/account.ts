import type { CompanyBillingStatus } from '@push/api-client'
import { isWebView } from '../../lib/bridge'
import { SEAT_LIMIT_NONE, SEAT_LIMIT_PRO, SEAT_LIMIT_ULTRA } from '../../../features/billing/constants'
import { COMPANY_BRAND, MEMBER_EMAIL, type MockSwitch, applications, blocks, companyMe, companyRecord, consent, employerPersona, failure, flags, googleIntegration, hold, internalError, json, links, mockPersona, mockSession, mockSwitch, persona, personaKey, readJson, routeTail, switches } from './core'

export const creditBalances = new Map<string, number>()

export const MONTHLY_MICRO: Record<string, number> = { BASIC: 18_000_000, PRO: 90_000_000, ULTRA: 180_000_000 }

export const seededBalance = () => {
  const kind = mockPersona()
  if (kind === 'employer') return 11_280_000
  if (kind === 'employer-pro') return 30_960_000
  if (kind === 'employer-ultra') return 154_740_000
  return 0
}

export const asEmployerPlan = (value: unknown): 'BASIC' | 'PRO' | 'ULTRA' | null =>
  value === 'BASIC' || value === 'PRO' || value === 'ULTRA' ? value : null

export const seatLimitFor = (plan: 'BASIC' | 'PRO' | 'ULTRA') =>
  plan === 'ULTRA' ? SEAT_LIMIT_ULTRA : plan === 'PRO' ? SEAT_LIMIT_PRO : SEAT_LIMIT_NONE

export const PACK_MICRO = 9_000_000

export const PAYMENT_TAILS = new Set(['/billing/checkout', '/billing/topup', '/billing/iap/verify', '/billing/toss/billing-auth', '/billing/toss/topup'])

export const MAX_PACKS = 20

export const localPlansUrl = (checkout: 'success' | 'credits') => `/employer/plans?checkout=${checkout}&session_id=cs_mock_${Date.now()}`

export const companyBillingStatus = (): CompanyBillingStatus => {
  const kind = mockPersona()
  const personal = kind === 'personal' || kind === null
  const plan = personal ? null : (companyMe()?.plan ?? null)
  const monthly = plan ? (MONTHLY_MICRO[plan] ?? 0) : 0
  const balance = mockSwitch('chat-limit') ? 0 : (creditBalances.get(personaKey()) ?? seededBalance())
  return {
    plan,
    audience: personal ? 'PERSONAL' : 'EMPLOYER',
    balanceMicroCredits: balance,
    subscriptionStatus: 'active',
    periodEndsAt: plan ? '2026-11-01T00:00:00.000Z' : null,
    reservedMicroCredits: 0,
    monthlyMicroCredits: monthly,
    spentMicroCredits: Math.max(0, monthly - balance),
    ...(mockSwitch('payments-disabled') ? { paymentsEnabled: false } : {}),
  }
}

export const billingChangeAllowed = () => {
  const company = companyMe()
  if (company) return company.role === 'ADMIN'
  return employerPersona()
}

export const handleBilling = async (method: string, pathname: string, input: RequestInfo | URL, init?: RequestInit) => {
  const tail = routeTail(pathname)
  if (method === 'GET' && tail === '/billing/ledger') {
    return json(200, { data: [], page: { nextCursor: null, hasMore: false, total: 0 } })
  }
  if (method === 'POST' && (tail === '/billing/checkout' || tail === '/billing/topup')) {
    if (!billingChangeAllowed()) {
      return json(403, { error: { code: 'FORBIDDEN', message: '요금제 변경은 관리자만 할 수 있어요' } })
    }
    const payload = await readJson(input, init)
    if (tail === '/billing/checkout') {
      const planId = typeof payload.planId === 'string' ? payload.planId : ''
      const plan = asEmployerPlan(planId)
      const record = companyRecord()
      if (plan && record) {
        const { spentMicroCredits } = companyBillingStatus()
        creditBalances.set(personaKey(), Math.max(0, (MONTHLY_MICRO[plan] ?? 0) - spentMicroCredits))
        record.company.plan = plan
        record.company.seats = { ...record.company.seats, limit: seatLimitFor(plan) }
      }
      return json(200, { data: { url: localPlansUrl('success') } })
    }
    const packs = payload.packs
    if (typeof packs !== 'number' || !Number.isInteger(packs) || packs < 1 || packs > MAX_PACKS) {
      return failure(400, 'VALIDATION_ERROR', '구매 수량을 확인해 주세요', { field: 'packs' })
    }
    creditBalances.set(personaKey(), (creditBalances.get(personaKey()) ?? seededBalance()) + packs * PACK_MICRO)
    return json(200, { data: { url: localPlansUrl('credits') } })
  }
  if (method === 'GET' && tail === '/billing') return json(200, { data: companyBillingStatus() })
  return null
}

export const PHONE_CODE_TTL_S = 180

export const phoneSent = (cooldownSeconds: number, ttlSeconds = PHONE_CODE_TTL_S) =>
  json(202, { data: { cooldownSeconds, expiresAt: new Date(Date.now() + ttlSeconds * 1000).toISOString() } })

export const handlePhone = (method: string, tail: string) => {
  if (method !== 'POST') return null
  if (tail === '/auth/phone/send') {
    if (mockSwitch('login-code-wrong')) return phoneSent(151)
    if (mockSwitch('login-code-expired')) return phoneSent(0, 0)
    if (mockSwitch('phone-sent')) return phoneSent(168)
    return phoneSent(PHONE_CODE_TTL_S)
  }
  if (tail === '/auth/phone/verify') {
    if (mockSwitch('login-phone-taken')) return failure(409, 'PHONE_ALREADY_REGISTERED', '이미 가입된 번호예요', { existingProviders: ['google'] })
    if (mockSwitch('login-code-wrong')) return failure(400, 'PHONE_CODE_INVALID', '인증번호가 맞지 않아요', { attemptsLeft: 4 })
    if (mockSwitch('login-code-expired')) return failure(400, 'PHONE_CODE_EXPIRED', '인증번호가 만료됐어요')
    if (mockSwitch('login-code-limit')) {
      return failure(429, 'RATE_LIMITED', '인증번호를 5번 잘못 입력했어요', { reason: 'TOO_MANY_ATTEMPTS', maxAttempts: 5 })
    }
    return json(200, { data: { ...mockSession('personal'), created: mockSwitch('signup-consent') } })
  }
  return null
}

export const OAUTH_CODE = 'mock-code'

export const callbackUrl = (accountType: string | null) => {
  const query = new URLSearchParams({ code: OAUTH_CODE, state: 'mock-state' })
  if (switches.size > 0) query.set('ms', [...switches].join(','))
  if (accountType === 'EMPLOYER') query.set('accountType', 'EMPLOYER')
  return `/auth/callback?mock&${query.toString()}`
}

export const handleOAuth = async (method: string, tail: string, url: URL) => {
  if (method === 'GET' && /^\/auth\/[a-z]+\/start$/.test(tail)) {
    if (mockSwitch('login-social-fail')) return failure(502, 'OAUTH_FAILED', 'Google 로그인에 실패했어요')
    return json(200, { data: { authorizationUrl: callbackUrl(url.searchParams.get('accountType')), state: 'mock-state' } })
  }
  if (method === 'POST' && tail === '/auth/exchange') {
    if (mockSwitch('login-social-fail')) return failure(401, 'OAUTH_FAILED', 'Google 로그인에 실패했어요')
    if (mockSwitch('auth-exchange-wait')) await hold()
    const employer = new URLSearchParams(typeof location === 'undefined' ? '' : location.search).get('accountType') === 'EMPLOYER'
    return json(200, { data: mockSession(persona ?? (employer ? 'employer' : 'personal')) })
  }
  return null
}

export const INVITE = {
  companyName: COMPANY_BRAND,
  inviterName: '이민아',
  inviterRole: 'ADMIN',
  email: 'jiho.han@moapay.kr',
  expiresAt: '2026-11-08T00:00:00.000Z',
}

export const inviteFailure = (token: string) => {
  if (mockSwitch('invite-invalid') || token === 'bad-token') return failure(404, 'NOT_FOUND', '초대 링크를 열 수 없어요', { reason: 'INVALID' })
  if (mockSwitch('invite-expired') || token === 'expired-token') {
    return failure(404, 'NOT_FOUND', '초대가 만료됐어요', {
      reason: 'EXPIRED',
      companyName: INVITE.companyName,
      inviterName: INVITE.inviterName,
      expiresAt: INVITE.expiresAt,
    })
  }
  return null
}

export const handleInvite = async (method: string, tail: string) => {
  const match = tail.match(/^\/companies\/invites\/([^/]+)(\/accept)?$/)
  if (!match) return null
  const token = decodeURIComponent(match[1] ?? '')
  const failed = inviteFailure(token)
  if (failed) return failed
  if (method === 'GET' && !match[2]) return json(200, { data: INVITE })
  if (method !== 'POST' || !match[2]) return null
  if (mockSwitch('invite-other-account')) return failure(403, 'FORBIDDEN', '초대받은 이메일로만 들어올 수 있어요', { reason: 'EMAIL_MISMATCH' })
  if (mockSwitch('invite-accept-wait')) await hold()
  return new Response(null, { status: 204 })
}

export const tokenExpired = (email: string) => failure(410, 'TOKEN_EXPIRED', '링크가 만료됐어요', { email })

export const emptyPage = () => json(200, { data: [], page: { nextCursor: null, hasMore: false, total: 0 } })

export const EMPTY_LISTS: [MockSwitch, string][] = [
  ['bookmarks-empty', '/me/bookmarks'],
  ['follows-empty', '/me/follows'],
  ['posts-empty', '/me/posts'],
  ['links-empty', '/me/links'],
  ['notif-empty', '/me/notifications'],
  ['inbox-empty', '/me/offers'],
  ['blocks-empty', '/me/blocks'],
  ['docs-empty', '/sources'],
  ['apply-no-docs', '/sources'],
]

export const LEDGER = [
  ['2026-10-01', 'PRO', 100],
  ['2026-09-01', 'PRO', 100],
  ['2026-08-01', 'PRO', 100],
  ['2026-07-01', 'BASIC', 20],
] as const

export const PLAN_NAMES = { BASIC: 'Basic', PRO: 'Pro', ULTRA: 'Ultra' } as const

export const ledgerEntries = () => {
  const rows = LEDGER.flatMap(([day, plan, amountUsd]) => {
    const createdAt = `${day}T00:00:00.000Z`
    return [
      {
        id: `ledger-${day}-payment`,
        type: 'PURCHASE',
        createdAt,
        amountMicroCredits: 0,
        balanceAfter: 0,
        referenceId: `cs_mock_${day}`,
        description: `${PLAN_NAMES[plan]} 월 구독`,
        amountUsd,
        receiptUrl: `https://pay.stripe.com/receipts/mock-${day}`,
      },
      {
        id: `ledger-${day}-grant`,
        type: 'PURCHASE',
        createdAt,
        amountMicroCredits: MONTHLY_MICRO[plan] ?? 0,
        balanceAfter: 0,
        referenceId: `monthly:${day.slice(0, 7)}:${plan}`,
        description: null,
        amountUsd: null,
        receiptUrl: null,
      },
    ]
  })
  let total = 0
  for (const row of [...rows].reverse()) {
    total += row.amountMicroCredits
    row.balanceAfter = total
  }
  return rows
}

export const switchResponse = async (method: string, tail: string, url: URL, input: RequestInfo | URL, init?: RequestInit) => {
  if (switches.size === 0 || isWebView()) return null
  if (method === 'GET') {
    const empty = EMPTY_LISTS.find(([name, path]) => mockSwitch(name) && tail === path)
    if (empty) return emptyPage()
    if (mockSwitch('load-fail') && /^\/postings\/(?!locations$)[^/]+$/.test(tail)) return internalError()
    if (mockSwitch('home-latest-error') && tail === '/postings' && url.searchParams.get('sort') === 'latest' && !url.searchParams.has('limit')) {
      return internalError()
    }
    if (mockSwitch('social-error') && tail === '/posts') return internalError()
    if (mockSwitch('slow') && (tail === '/postings' || tail === '/me/bookmarks' || tail === '/applications')) await hold()
    if (mockSwitch('billing-ledger') && tail === '/billing/ledger') {
      const data = ledgerEntries()
      return json(200, { data, page: { nextCursor: null, hasMore: false, total: data.length } })
    }
    if (mockSwitch('calendar-google-off') && tail === '/integrations/google') return json(200, { data: googleIntegration(false) })
  }
  if (method === 'POST') {
    if (/^\/postings\/[^/]+\/apply$/.test(tail)) {
      if (mockSwitch('apply-fail')) return internalError()
      if (mockSwitch('apply-slow')) await hold()
    }
    if (mockSwitch('offer-blocked') && /^\/profiles\/[^/]+\/offer$/.test(tail)) {
      return failure(403, 'BLOCKED', '지금은 이 사람에게 제안을 보낼 수 없어요')
    }
    if (mockSwitch('docs-uploading') && tail === '/sources') await hold()
    if (mockSwitch('payments-disabled') && PAYMENT_TAILS.has(tail)) return failure(503, 'PAYMENTS_DISABLED', '지금은 결제할 수 없어요')
    if (mockSwitch('inbox-cant-send') && /^\/me\/offers\/[^/]+\/messages$/.test(tail)) {
      return failure(403, 'BLOCKED', 'this user is not accepting messages from you')
    }
    if (mockSwitch('signup-taken-employer') && tail === '/auth/email/signup') {
      const payload = await readJson(input, init)
      if (payload.email === MEMBER_EMAIL) return failure(409, 'EMAIL_TAKEN', 'taken', { accountType: 'EMPLOYER' })
    }
    if (mockSwitch('verify-expired') && tail === '/auth/email/verify') return tokenExpired(MEMBER_EMAIL)
    if (mockSwitch('pw-reset-expired') && tail === '/auth/email/password-reset/confirm') return tokenExpired(MEMBER_EMAIL)
  }
  if (method === 'PATCH' || method === 'PUT') {
    if (mockSwitch('profile-save-fail') && tail === '/me/profile') return internalError()
    if (mockSwitch('applicant-move-fail') && /^\/postings\/[^/]+\/applicants\/[^/]+$/.test(tail)) return internalError()
  }
  if (mockSwitch('docs-delete-fail') && (method === 'DELETE' ? /^\/sources\/[^/]+$/ : /^\/documents\/[^/]+\/archive$/).test(tail)) {
    return internalError()
  }
  return null
}

export const flagFor = (id: string) => flags.get(id) ?? { bookmarked: false, applied: false }

export const setFlag = (id: string, patch: Partial<{ bookmarked: boolean; applied: boolean }>) => {
  flags.set(id, { ...flagFor(id), ...patch })
}
