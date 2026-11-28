import { searchHangul } from '@push/shared'
import { sessionStore } from '../../auth/session'
import { isWebView } from '../../lib/bridge'
import { APP_PROFILES, HUB_PROFILES, LISTINGS, SEARCH_BOARDS } from './fixtures'
import { handleBilling, handleContact, handleInvite, handleOAuth, handlePhone, setFlag, switchResponse, tokenExpired } from './account'
import { handleEmployerChat } from './chat'
import { handleCommunity } from './community'
import { APP_VIEWER_ID, MEMBER_EMAIL, MEMBER_USER, REPEAT_MARK, TAKEN_EMAILS, allSources, catalogPage, companyRecord, detailFor, feed, filteredPostings, hubProfiles, json, libraryItem, listings, loginPersona, matches, mockSession, mockSwitch, ownedPostingResponse, persona, present, profileById, readJson, routeTail, signedOf, withFlags } from './core'
import { handleEmployerPostings } from './postings'

export { MOCK_SWITCHES, mockFit, mockPersona, mockSession, mockSwitch, setMockPersona, setMockSwitches } from './core'
export type { Fit, MockPersona, MockSwitch, PostingView } from './core'
export { queueBusyBody } from './chat'

let signupEmail = ''

export const mockFetch: typeof fetch = async (input, init) => {
  const requestUrl = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
  const url = new URL(requestUrl, typeof location === 'undefined' ? 'http://localhost' : location.href)
  const pathname = url.pathname
  const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase()
  const signed = signedOf(input, init)
  await new Promise((resolve) => setTimeout(resolve, 250))
  const tail = routeTail(pathname)
  const switched = (await switchResponse(method, tail, url, input, init)) ?? handlePhone(method, tail)
  if (switched) return switched
  const auth = (await handleOAuth(method, tail, url)) ?? (await handleInvite(method, tail))
  if (auth) return auth
  const contactResponse = await handleContact(method, tail, input, init)
  if (contactResponse) return contactResponse
  const billing = await handleBilling(method, pathname, input, init)
  if (billing) return billing
  const employerChat = await handleEmployerChat(method, url, pathname, input, init)
  if (employerChat) return employerChat
  const employerPosting = await handleEmployerPostings(method, url, pathname, input, init)
  if (employerPosting) return employerPosting
  if (method === 'GET' && pathname.endsWith('/postings/locations')) {
    const counts = new Map<string, number>()
    for (const item of listings) counts.set(item.location, (counts.get(item.location) ?? 0) + 1)
    return json(200, { data: [...counts].map(([location, count]) => ({ location, count })) })
  }
  const bookmarkMatch = pathname.match(/\/postings\/([^/]+)\/bookmark$/)
  if (bookmarkMatch && (method === 'POST' || method === 'DELETE')) {
    setFlag(bookmarkMatch[1] ?? '', { bookmarked: method === 'POST' })
    return new Response(null, { status: 204 })
  }
  const applyMatch = pathname.match(/\/postings\/([^/]+)\/apply$/)
  if (applyMatch && method === 'POST') {
    const id = applyMatch[1] ?? ''
    setFlag(id, { applied: true })
    const item = listings.find((row) => row.id === id)
    const now = new Date().toISOString()
    return json(200, {
      data: {
        id: 'app-1',
        revision: 1,
        jobId: id,
        company: item?.company ?? LISTINGS[0]!.company,
        title: item?.title ?? LISTINGS[0]!.title,
        stage: 'APPLIED',
        appliedAt: now,
        createdAt: now,
      },
    })
  }
  if (method === 'GET' && /\/postings\/?$/.test(pathname)) return json(200, catalogPage(url, filteredPostings(url, signed)))
  if (method === 'GET' && /\/search\/?$/.test(pathname)) {
    const q = url.searchParams.get('q') ?? ''
    const type = url.searchParams.get('type') ?? 'postings'
    const board = SEARCH_BOARDS[q.trim()]
    if (type === 'people') {
      const data = board
        ? board.peopleIds.map(profileById)
        : searchHangul(hubProfiles, q, (item) => [item.displayName, item.headline]).map((row) => withFlags(row.item))
      return json(200, { data, page: { nextCursor: null, hasMore: false, total: board?.people ?? data.length } })
    }
    if (type === 'posts') {
      const data = searchHangul(feed, q, (item) => [item.title, item.body]).map((row) => row.item)
      return json(200, { data, page: { nextCursor: null, hasMore: false, total: board?.posts ?? data.length } })
    }
    const found = board
      ? board.postingIds.flatMap((id) => listings.filter((item) => item.id === id))
      : q.trim()
        ? searchHangul(listings, q, (item) => [item.company, item.title]).map((row) => row.item)
        : listings
    const data = found.map((item) => present(item, signed))
    return json(200, { data, page: { nextCursor: null, hasMore: false, total: board?.postings ?? data.length } })
  }
  if (method === 'GET' && /\/sources\/?$/.test(pathname)) {
    const kind = url.searchParams.get('kind')
    const data = kind === 'AI' ? [] : allSources().map(libraryItem)
    return json(200, { data, page: { nextCursor: null, hasMore: false } })
  }
  if (method === 'GET' && /\/postings\/[^/]+$/.test(pathname)) {
    const id = decodeURIComponent(pathname.match(/\/postings\/([^/]+)$/)?.[1] ?? '').split(REPEAT_MARK)[0] ?? ''
    const listed = listings.find((item) => item.id === id)
    if (listed) return json(200, { data: detailFor(listed, signed) })
    const owned = ownedPostingResponse(id)
    if (owned) return owned
    return json(404, { error: { code: 'NOT_FOUND', message: '공고를 찾지 못했어요' } })
  }
  if (method === 'GET' && /\/profiles\/[^/]+$/.test(pathname)) {
    const id = pathname.match(/\/profiles\/([^/]+)$/)?.[1] ?? HUB_PROFILES[0]!.userId
    const app = isWebView() ? APP_PROFILES[id === APP_VIEWER_ID ? 'me' : id] : undefined
    const profile = app ? withFlags(app) : profileById(id)
    return json(200, { data: mockSwitch('offer-blocked') ? { ...profile, blockedMe: true } : profile })
  }
  if (method === 'POST' && matches(pathname, '/auth/email/signup')) {
    const payload = await readJson(input, init)
    const email = String(payload.email ?? '')
    if (TAKEN_EMAILS.includes(email)) {
      return json(409, {
        error: { code: 'EMAIL_TAKEN', message: 'taken', details: { accountType: 'PERSONAL' } },
      })
    }
    signupEmail = email
    return new Response(null, { status: 202 })
  }
  if (method === 'POST' && matches(pathname, '/auth/email/login')) {
    const payload = await readJson(input, init)
    const email = String(payload.email ?? '')
    const password = String(payload.password ?? '')
    if (password.length < 8 || password.includes('wrong') || email === 'bad@push.app') {
      return json(401, { error: { code: 'INVALID_CREDENTIALS', message: 'no' } })
    }
    if (email === 'unverified@push.app') {
      return json(403, { error: { code: 'EMAIL_NOT_VERIFIED', message: 'unverified' } })
    }
    return json(200, { data: mockSession(loginPersona(email)) })
  }
  if (method === 'POST' && matches(pathname, '/auth/email/verify/resend')) return new Response(null, { status: 204 })
  if (method === 'POST' && matches(pathname, '/auth/email/verify')) {
    const payload = await readJson(input, init)
    const token = String(payload.token ?? '')
    if (token === 'bad') return json(401, { error: { code: 'UNAUTHENTICATED', message: 'bad' } })
    if (String(payload.password ?? '').length < 8) {
      return json(400, { error: { code: 'VALIDATION_ERROR', message: 'password', details: { field: 'password' } } })
    }
    const kind = token === 'employer' || signupEmail.startsWith('employer') ? 'employer-new' : 'personal'
    return json(200, { data: mockSession(kind) })
  }
  if (method === 'GET' && /\/auth\/email\/password-reset\/[^/]+$/.test(pathname)) {
    return mockSwitch('pw-reset-expired') ? tokenExpired(MEMBER_EMAIL) : json(200, { data: { email: MEMBER_EMAIL } })
  }
  if (method === 'POST' && matches(pathname, '/auth/email/password-reset/confirm')) {
    return new Response(null, { status: 204 })
  }
  if (method === 'POST' && matches(pathname, '/auth/email/password-reset')) {
    return new Response(null, { status: 202 })
  }
  if (method === 'GET' && matches(pathname, '/auth/me')) {
    const user = sessionStore.load()?.user
    const record = companyRecord()
    return json(200, {
      data: {
        id: user?.id ?? 'u1',
        displayName: user?.displayName ?? '김서준',
        locale: user?.locale ?? 'ko',
        createdAt: '2026-10-01T00:00:00.000Z',
        accountType: user?.accountType ?? 'PERSONAL',
        companyId: record?.company.id ?? user?.companyId ?? null,
        companyRole: record?.company.role ?? user?.companyRole ?? null,
        email: user?.id === MEMBER_USER.id ? MEMBER_USER.email : user?.accountType === 'EMPLOYER' ? MEMBER_EMAIL : 'seojun.kim@gmail.com',
        provider: user?.accountType === 'EMPLOYER' ? 'email' : 'google',
      },
    })
  }
  if (method === 'POST' && matches(pathname, '/auth/logout')) return new Response(null, { status: 204 })
  if (method === 'POST' && matches(pathname, '/auth/refresh')) {
    return json(200, { data: sessionStore.load() ?? mockSession(persona ?? 'personal') })
  }
  const community = await handleCommunity(method, url, pathname, input, init)
  if (community) return community
  return json(404, { error: { code: 'NOT_FOUND', message: `mock: ${pathname}` } })
}
