import type { Comment, Offer, OfferMessage, Post, Settings, Source, UserLink } from '@push/api-client'
import { LEGAL_VERSION } from '@push/shared'
import { CALENDAR_EVENTS } from './fixtures'
import { COMPANY_BRAND, type CompanyRecord, RESEND_COOLDOWN_SEC, adminMember, adminOnly, allSources, applications, archivedDocs, asCareers, asStrings, blockList, blocks, calendarEvents, cantSend, commentThreads, companyMe, companyRecord, consent, consentNow, currentUserId, documentRevisions, employerPersona, failedReply, failure, feed, googleIntegration, hubProfiles, inviteView, inviteWindow, json, links, listings, meProfile, mockPersona, myPosts, noticeBox, offerById, offerThreads, offerView, pendingInvite, postById, present, profileById, pushDocument, readForm, readJson, receivedOffers, rememberCompany, removeSource, respondedAt, routeTail, seedSources, sentOffers, setNoticeBox, settings, signedOf, slicePage, socialFlags, splitParam, uploadedSources, withFlags, setSentOffers, setFeed, setLinks, setSettings, setConsent, setMeProfile, setBlocks } from './core'

export const handleCommunity = async (method: string, url: URL, pathname: string, input: RequestInfo | URL, init?: RequestInit) => {
  const tail = routeTail(pathname)
  if (method === 'POST' && tail === '/uploads/images') {
    return json(200, { data: { key: `img-${Date.now()}`, url: '/api/v1/uploads/images/mock.png' } })
  }
  if (method === 'POST' && tail === '/sources') {
    const form = await readForm(input, init)
    const file = form?.get('file')
    const named = typeof File !== 'undefined' && file instanceof File
    const source: Source = {
      id: `src-up-${uploadedSources.length + 1}`,
      fileName: named ? file.name : '이력서.pdf',
      mimeType: named && file.type ? file.type : 'application/pdf',
      size: named ? file.size : 1024,
      sha256: 'upload',
      status: 'READY',
      createdAt: new Date().toISOString(),
    }
    uploadedSources.unshift(source)
    return json(200, { data: source })
  }
  const sourceMatch = tail.match(/^\/sources\/([^/]+)$/)
  if (sourceMatch) {
    const found = allSources().find((item) => item.id === sourceMatch[1])
    if (!found) return json(404, { error: { code: 'NOT_FOUND', message: '서류를 찾지 못했어요' } })
    if (method === 'GET') return json(200, { data: found })
    if (method === 'DELETE') {
      removeSource(found.id)
      return new Response(null, { status: 204 })
    }
    if (method === 'PATCH') {
      const payload = await readJson(input, init)
      if (typeof payload.fileName === 'string' && payload.fileName.trim()) found.fileName = payload.fileName.trim()
      return json(200, { data: found })
    }
  }
  const documentMatch = tail.match(/^\/documents\/([^/]+)(\/archive|\/restore|\/versions\/[^/]+\/export)?$/)
  if (documentMatch) {
    const [, rawId = '', sub] = documentMatch
    const id = decodeURIComponent(rawId)
    const archived = archivedDocs.get(id)
    const found = allSources().find((item) => item.id === id && item.kind === 'AI_MADE') ?? archived?.source
    if (!found || found.kind !== 'AI_MADE') return json(404, { error: { code: 'NOT_FOUND', message: 'resource not found' } })
    if (method === 'GET' && !sub) return json(200, { data: pushDocument(found) })
    if (method === 'GET' && sub?.endsWith('/export')) {
      return new Response(new Blob([`%PDF-1.4 mock ${found.fileName}`], { type: 'application/pdf' }), {
        status: 200,
        headers: { 'content-type': 'application/pdf' },
      })
    }
    const payload = await readJson(input, init)
    const revision = documentRevisions.get(found.id) ?? 1
    if (payload.expectedRevision !== revision) {
      return json(409, { error: { code: 'REVISION_CONFLICT', message: 'resource was modified', details: { currentRevision: revision } } })
    }
    if (method === 'POST' && sub === '/archive') {
      documentRevisions.set(found.id, revision + 1)
      const list = uploadedSources.includes(found) ? uploadedSources : seedSources
      removeSource(found.id)
      archivedDocs.set(found.id, { source: found, list })
      return json(200, { data: pushDocument(found, 'ARCHIVED') })
    }
    if (method === 'POST' && sub === '/restore') {
      if (!archived) return json(200, { data: pushDocument(found) })
      documentRevisions.set(found.id, revision + 1)
      archived.list.unshift(archived.source)
      archivedDocs.delete(found.id)
      return json(200, { data: pushDocument(found) })
    }
    if (method === 'PATCH' && !sub && typeof payload.title === 'string' && payload.title.trim()) {
      documentRevisions.set(found.id, revision + 1)
      found.fileName = payload.title.trim()
      return json(200, { data: pushDocument(found) })
    }
  }
  if (method === 'GET' && tail === '/profiles') {
    const categories = splitParam(url, 'category')
    const items = hubProfiles
      .filter((item) => categories.length === 0 || (item.jobCategory !== null && categories.includes(item.jobCategory)))
      .map(withFlags)
    return json(200, slicePage(url, items, (item) => item.userId))
  }
  const offerCreate = tail.match(/^\/profiles\/([^/]+)\/offer$/)
  if (offerCreate && method === 'POST') {
    const id = offerCreate[1] ?? ''
    const payload = await readJson(input, init)
    const created: Offer = {
      id: `offer-${Date.now()}`,
      sender: { id: 'u1', displayName: meProfile.displayName, avatarUrl: null, companyName: null, headline: meProfile.headline },
      recipient: { id, displayName: profileById(id).displayName, avatarUrl: null, companyName: null, headline: profileById(id).headline },
      message: String(payload.message ?? ''),
      posting: null,
      status: 'SENT',
      readAt: null,
      createdAt: new Date().toISOString(),
    }
    setSentOffers([created, ...sentOffers])
    const flag = socialFlags.get(id) ?? { following: false, offered: false }
    socialFlags.set(id, { ...flag, offered: true })
    return json(200, { data: created })
  }
  const followMatch = tail.match(/^\/users\/([^/]+)\/follow$/)
  if (followMatch && (method === 'POST' || method === 'DELETE')) {
    const id = followMatch[1] ?? ''
    const flag = socialFlags.get(id) ?? { following: false, offered: false }
    socialFlags.set(id, { ...flag, following: method === 'POST' })
    return new Response(null, { status: 204 })
  }
  if (method === 'GET' && tail === '/posts') {
    const category = url.searchParams.get('category')
    const items = feed.filter((item) => !category || item.category === category)
    return json(200, slicePage(url, items, (item) => item.id))
  }
  if (method === 'POST' && tail === '/posts') {
    const payload = await readJson(input, init)
    const keys = asStrings(payload.imageKeys) ?? []
    const created: Post = {
      id: `post-${feed.length + 1}`,
      author: employerPersona()
        ? { id: 'u1', displayName: COMPANY_BRAND, avatarUrl: null, employer: true, companyName: COMPANY_BRAND }
        : { id: 'u1', displayName: '김서준', avatarUrl: null },
      category: (typeof payload.category === 'string' ? payload.category : 'work') as Post['category'],
      title: String(payload.title ?? ''),
      body: String(payload.body ?? ''),
      imageUrls: keys.map((key) => `/api/v1/uploads/images/${key}`),
      commentCount: 0,
      viewCount: 0,
      createdAt: new Date().toISOString(),
    }
    setFeed([created, ...feed])
    return json(200, { data: created })
  }
  const commentsMatch = tail.match(/^\/posts\/([^/]+)\/comments$/)
  if (commentsMatch) {
    const postId = commentsMatch[1] ?? ''
    const postItem = postById(postId)
    if (!postItem) return json(404, { error: { code: 'NOT_FOUND', message: '글을 찾지 못했어요' } })
    if (method === 'GET') {
      const data = commentThreads.get(postId) ?? []
      return json(200, { data, page: { nextCursor: null, hasMore: false, total: data.length } })
    }
    if (method === 'POST') {
      const payload = await readJson(input, init)
      const company = companyMe()
      const author: Comment['author'] =
        employerPersona() && company
          ? { id: 'u1', displayName: COMPANY_BRAND, avatarUrl: null, employer: true, companyName: COMPANY_BRAND }
          : employerPersona()
            ? { id: 'u1', displayName: '새 담당자', avatarUrl: null, employer: true, companyName: null }
            : { id: 'u1', displayName: '김서준', avatarUrl: null }
      const comment: Comment = {
        id: `c-${Date.now()}`,
        author,
        body: String(payload.body ?? ''),
        parentId: typeof payload.parentId === 'string' ? payload.parentId : null,
        createdAt: new Date().toISOString(),
      }
      const list = commentThreads.get(postId) ?? []
      list.push(comment)
      commentThreads.set(postId, list)
      postItem.commentCount += 1
      return json(200, { data: comment })
    }
  }
  const postMatch = tail.match(/^\/posts\/([^/]+)$/)
  if (postMatch && method === 'GET') {
    const postItem = postById(postMatch[1] ?? '')
    return postItem ? json(200, { data: postItem }) : json(404, { error: { code: 'NOT_FOUND', message: '글을 찾지 못했어요' } })
  }
  if (tail === '/me/profile' && method === 'GET') return json(200, { data: meProfile })
  if (tail === '/me/profile' && method === 'PATCH') {
    const payload = await readJson(input, init)
    const careers = asCareers(payload.careers)
    const skills = asStrings(payload.skills)
    setMeProfile({
      ...meProfile,
      displayName: typeof payload.displayName === 'string' ? payload.displayName : meProfile.displayName,
      headline: typeof payload.headline === 'string' ? payload.headline : meProfile.headline,
      intro: typeof payload.intro === 'string' ? payload.intro : meProfile.intro,
      careers: careers ?? meProfile.careers,
      skills: skills ?? meProfile.skills,
      updatedAt: new Date().toISOString(),
    })
    return json(200, { data: meProfile })
  }
  if (method === 'GET' && tail === '/me/links') {
    const kind = url.searchParams.get('kind')
    const data = links.filter((item) => !kind || item.kind === kind)
    return json(200, { data, page: { nextCursor: null, hasMore: false, total: data.length } })
  }
  if (method === 'POST' && tail === '/me/links') {
    const payload = await readJson(input, init)
    const created: UserLink = {
      id: `l-${links.length + 1}`,
      kind: (typeof payload.kind === 'string' ? payload.kind : 'other') as UserLink['kind'],
      url: String(payload.url ?? ''),
      title: String(payload.title ?? payload.url ?? ''),
      status: null,
      fitCount: 0,
      aiRead: false,
      createdAt: new Date().toISOString(),
    }
    setLinks([created, ...links])
    return json(200, { data: created })
  }
  if (method === 'GET' && tail === '/me/bookmarks') {
    const signed = signedOf(input, init)
    return json(200, slicePage(url, listings.filter((item) => present(item, signed).bookmarked), (item) => item.id))
  }
  if (method === 'GET' && tail === '/me/follows') {
    const ids = new Set<string>()
    for (const item of hubProfiles) if (withFlags(item).following) ids.add(item.userId)
    for (const [id, flag] of socialFlags) if (flag.following) ids.add(id)
    return json(200, { data: [...ids].map((id) => profileById(id)), page: { nextCursor: null, hasMore: false, total: ids.size } })
  }
  if (method === 'GET' && tail === '/me/posts') {
    const mine = employerPersona()
      ? feed.filter((item) => item.author.employer === true)
      : [...feed.filter((item) => item.author.id === 'u1' && item.author.employer !== true), ...myPosts]
    return json(200, slicePage(url, mine, (item) => item.id))
  }
  if (method === 'GET' && tail === '/me/commented-posts') {
    const commented = feed.filter((item) => (commentThreads.get(item.id) ?? []).some((comment) => comment.author.id === 'u1'))
    return json(200, slicePage(url, commented, (item) => item.id))
  }
  if (method === 'GET' && tail === '/applications') {
    return json(200, { data: applications, page: { nextCursor: null, hasMore: false, total: applications.length } })
  }
  if (method === 'GET' && tail === '/calendar/events') {
    const from = url.searchParams.get('from') ?? ''
    const to = url.searchParams.get('to') ?? ''
    const data = calendarEvents.filter((event) => (!from || event.startsAt >= from) && (!to || event.startsAt < to))
    return json(200, { data, page: { nextCursor: null, hasMore: false, total: data.length } })
  }
  if (method === 'GET' && tail === '/integrations/google') return json(200, { data: googleIntegration(true) })
  if (method === 'POST' && tail === '/calendar/events') {
    const payload = await readJson(input, init)
    const now = new Date().toISOString()
    const created: (typeof calendarEvents)[number] = {
      ...CALENDAR_EVENTS[0]!,
      id: `ev-${calendarEvents.length + 1}`,
      type: (typeof payload.type === 'string' ? payload.type : 'INTERVIEW') as (typeof calendarEvents)[number]['type'],
      title: String(payload.title ?? ''),
      startsAt: String(payload.startsAt ?? now),
      endsAt: String(payload.endsAt ?? payload.startsAt ?? now),
      source: 'PUSH' as (typeof calendarEvents)[number]['source'],
      notes: String(payload.notes ?? ''),
      createdAt: now,
      updatedAt: now,
    }
    calendarEvents.push(created)
    return json(201, { data: created })
  }
  if (method === 'GET' && tail === '/me/offers') {
    const box = url.searchParams.get('box')
    const blocked = new Set(blockList().map((item) => item.user.id))
    const archived = url.searchParams.get('archived') === '1'
    const received = receivedOffers.filter((item) => !blocked.has(item.sender.id))
    const data = employerPersona()
      ? []
      : (box === 'sent' ? sentOffers : received).filter((item) => archived === Boolean(item.archivedAt)).map(offerView)
    return json(200, { data, page: { nextCursor: null, hasMore: false, total: data.length } })
  }
  if (method === 'GET' && tail === '/me/blocks') {
    const data = blockList()
    return json(200, { data, page: { nextCursor: null, hasMore: false, total: data.length } })
  }
  if (method === 'POST' && tail === '/me/blocks') {
    const payload = await readJson(input, init)
    const userId = String(payload.userId ?? '')
    const known = [...receivedOffers.map((item) => item.sender), ...sentOffers.map((item) => item.recipient)].find((item) => item.id === userId)
    const profile = hubProfiles.find((item) => item.userId === userId)
    const user = known ?? { id: userId, displayName: profile?.displayName ?? userId, avatarUrl: null, companyName: null, headline: profile?.headline ?? '' }
    if (!blockList().some((item) => item.user.id === userId)) setBlocks([{ user, createdAt: new Date().toISOString() }, ...blockList()])
    return new Response(null, { status: 204 })
  }
  const blockMatch = tail.match(/^\/me\/blocks\/([^/]+)$/)
  if (blockMatch && method === 'DELETE') {
    setBlocks(blockList().filter((item) => item.user.id !== decodeURIComponent(blockMatch[1] ?? '')))
    return new Response(null, { status: 204 })
  }
  const offerAction = tail.match(/^\/me\/offers\/([^/]+)\/(archive|unarchive|report)$/)
  if (offerAction && method === 'POST') {
    const found = offerById(offerAction[1] ?? '')
    if (!found) return json(404, { error: { code: 'NOT_FOUND', message: '제안을 찾지 못했어요' } })
    if (offerAction[2] === 'report') return new Response(null, { status: 204 })
    found.archivedAt = offerAction[2] === 'archive' ? new Date().toISOString() : null
    return json(200, { data: offerView(found) })
  }
  const offerMessages = tail.match(/^\/me\/offers\/([^/]+)\/messages$/)
  if (offerMessages) {
    const id = offerMessages[1] ?? ''
    if (!offerById(id)) return json(404, { error: { code: 'NOT_FOUND', message: '제안을 찾지 못했어요' } })
    if (method === 'GET') {
      const data = [...(offerThreads.get(id) ?? []), ...(cantSend(id) ? [failedReply(id)] : [])]
      return json(200, { data, page: { nextCursor: null, hasMore: false, total: data.length } })
    }
    if (method === 'POST') {
      const payload = await readJson(input, init)
      const created: OfferMessage = {
        id: `msg-${Date.now()}`,
        offerId: id,
        sender: { id: 'u1', displayName: meProfile.displayName, avatarUrl: null },
        body: String(payload.body ?? ''),
        createdAt: new Date().toISOString(),
      }
      const list = offerThreads.get(id) ?? []
      list.push(created)
      offerThreads.set(id, list)
      return json(200, { data: created })
    }
  }
  const offerAccept = tail.match(/^\/me\/offers\/([^/]+)\/accept$/)
  if (offerAccept && method === 'POST') {
    const found = offerById(offerAccept[1] ?? '')
    if (!found) return json(404, { error: { code: 'NOT_FOUND', message: '제안을 찾지 못했어요' } })
    const payload = await readJson(input, init)
    found.status = 'ACCEPTED'
    respondedAt.set(found.id, new Date().toISOString())
    if (typeof payload.reply === 'string' && payload.reply.trim()) {
      const list = offerThreads.get(found.id) ?? []
      list.push({
        id: `msg-${Date.now()}`,
        offerId: found.id,
        sender: { id: 'u1', displayName: meProfile.displayName, avatarUrl: null },
        body: payload.reply.trim(),
        createdAt: new Date().toISOString(),
      })
      offerThreads.set(found.id, list)
    }
    return json(200, { data: offerView(found) })
  }
  const offerDecline = tail.match(/^\/me\/offers\/([^/]+)\/decline$/)
  if (offerDecline && method === 'POST') {
    const found = offerById(offerDecline[1] ?? '')
    if (!found) return json(404, { error: { code: 'NOT_FOUND', message: '제안을 찾지 못했어요' } })
    found.status = 'DECLINED'
    respondedAt.set(found.id, new Date().toISOString())
    return json(200, { data: offerView(found) })
  }
  const offerDetail = tail.match(/^\/me\/offers\/([^/]+)$/)
  if (offerDetail && method === 'GET') {
    const found = offerById(offerDetail[1] ?? '')
    if (!found) return json(404, { error: { code: 'NOT_FOUND', message: '제안을 찾지 못했어요' } })
    return json(200, { data: offerView(found) })
  }
  if (method === 'POST' && tail === '/me/notifications/read') {
    const payload = await readJson(input, init)
    const now = new Date().toISOString()
    const ids = Array.isArray(payload.ids) ? new Set(payload.ids.map(String)) : null
    setNoticeBox(noticeBox().map((item) => (payload.all === true || ids?.has(item.id) ? { ...item, readAt: item.readAt ?? now } : item)))
    return new Response(null, { status: 204 })
  }
  if (method === 'GET' && tail === '/me/notifications') {
    const box = noticeBox()
    return json(200, { data: box, page: { nextCursor: null, hasMore: false, total: box.length } })
  }
  if (tail === '/me/settings' && method === 'GET') return json(200, { data: settings })
  if (tail === '/me/settings' && method === 'PATCH') {
    const payload = await readJson(input, init)
    setSettings({ ...settings, ...(payload as Partial<Settings>) })
    return json(200, { data: settings })
  }
  if (tail === '/me/consents' && method === 'GET') return json(200, { data: consentNow() })
  if (tail === '/me/consents' && method === 'PUT') {
    const payload = await readJson(input, init)
    setConsent({ ...consent, referenceData: Boolean(payload.referenceData), updatedAt: new Date().toISOString() })
    return json(200, { data: consentNow() })
  }
  if (tail === '/me/consents/terms' && method === 'PUT') {
    const payload = await readJson(input, init)
    const at = new Date().toISOString()
    setConsent({
      ...consent,
      terms: { version: LEGAL_VERSION, age14At: at, serviceTermsAt: at, privacyAt: at, marketing: Boolean(payload.marketing), marketingAt: payload.marketing ? at : null },
    })
    return json(200, { data: consent })
  }
  if (method === 'POST' && tail === '/companies/verify') {
    const payload = await readJson(input, init)
    const bNo = String(payload.bNo ?? '').replace(/\D/g, '')
    if (bNo === '0000000000' || bNo.length !== 10) {
      return json(422, {
        error: {
          code: 'BUSINESS_NOT_VERIFIED',
          message: '사업자 정보를 확인하지 못했어요',
          details: { reason: 'MISMATCH' },
        },
      })
    }
    if (bNo === '1111111111') {
      return json(409, { error: { code: 'COMPANY_EXISTS', message: '이미 등록된 사업자번호예요' } })
    }
    const verifiedAt = new Date().toISOString()
    const legalName = String(payload.legalName ?? '').trim()
    const company: CompanyRecord['company'] = {
      id: 'co-1',
      bNo,
      name: String(payload.bNm ?? ''),
      legalName: legalName || null,
      representativeName: null,
      industry: null,
      website: null,
      intro: null,
      logoKey: null,
      logoUrl: null,
      plan: null,
      verifiedAt,
      role: 'ADMIN',
      seats: { used: 0, limit: 0 },
    }
    rememberCompany({ company, members: [adminMember(verifiedAt)], invites: [] })
    return json(201, { data: company })
  }
  if (method === 'GET' && tail === '/companies/me/members') {
    const record = companyRecord()
    if (!record) return json(404, { error: { code: 'COMPANY_NOT_FOUND', message: '회사를 찾지 못했어요' } })
    return json(200, { data: record.members })
  }
  if (method === 'GET' && tail === '/companies/me/invites') {
    const record = companyRecord()
    if (!record) return json(404, { error: { code: 'COMPANY_NOT_FOUND', message: '회사를 찾지 못했어요' } })
    return json(200, { data: record.invites.map(inviteView) })
  }
  if (method === 'POST' && tail === '/companies/me/invites') {
    const record = companyRecord()
    if (!record) return json(404, { error: { code: 'COMPANY_NOT_FOUND', message: '회사를 찾지 못했어요' } })
    if (record.company.role !== 'ADMIN') return adminOnly()
    const payload = await readJson(input, init)
    const email = String(payload.email ?? '')
    const same = (other: string) => other.toLowerCase() === email.toLowerCase()
    if (record.members.some((member) => same(member.email))) {
      return json(409, { error: { code: 'CONFLICT', message: '이미 담당자예요' } })
    }
    const pending = record.invites.find((item) => same(item.email))
    if (pending) {
      Object.assign(pending, inviteWindow())
      return json(201, { data: { email } })
    }
    if (record.company.seats.used >= record.company.seats.limit) {
      return json(403, { error: { code: 'SEAT_LIMIT', message: '담당자 수를 넘었어요' } })
    }
    record.invites.push(pendingInvite(email))
    record.company.seats.used += 1
    return json(201, { data: { email } })
  }
  const invitePath = tail.match(/^\/companies\/me\/invites\/([^/]+)(\/resend)?$/)
  if (invitePath && ((method === 'POST' && invitePath[2]) || (method === 'DELETE' && !invitePath[2]))) {
    const record = companyRecord()
    if (!record) return json(404, { error: { code: 'COMPANY_NOT_FOUND', message: '회사를 찾지 못했어요' } })
    if (record.company.role !== 'ADMIN') return adminOnly()
    const invite = record.invites.find((item) => item.id === decodeURIComponent(invitePath[1] ?? ''))
    if (!invite) return failure(404, 'NOT_FOUND', '초대를 찾지 못했어요')
    if (method === 'DELETE') {
      record.invites = record.invites.filter((item) => item !== invite)
      record.company.seats.used = Math.max(0, record.company.seats.used - 1)
      return new Response(null, { status: 204 })
    }
    const wait = RESEND_COOLDOWN_SEC - Math.floor((Date.now() - invite.sentAt) / 1000)
    if (wait > 0) return failure(429, 'RATE_LIMITED', '잠시 후 다시 보내 주세요', { retryAfterSec: wait })
    Object.assign(invite, inviteWindow())
    return json(200, { data: inviteView(invite) })
  }
  const memberPath = tail.match(/^\/companies\/me\/members\/([^/]+)$/)
  if (memberPath && (method === 'DELETE' || method === 'PATCH')) {
    const record = companyRecord()
    if (!record) return json(404, { error: { code: 'COMPANY_NOT_FOUND', message: '회사를 찾지 못했어요' } })
    if (record.company.role !== 'ADMIN') return adminOnly()
    const userId = decodeURIComponent(memberPath[1] ?? '')
    if (method === 'DELETE') {
      const index = record.members.findIndex((member) => member.userId === userId)
      if (index < 0) return json(404, { error: { code: 'NOT_FOUND', message: '담당자를 찾지 못했어요' } })
      record.members.splice(index, 1)
      record.company.seats.used = Math.max(0, record.company.seats.used - 1)
      return new Response(null, { status: 204 })
    }
    const payload = await readJson(input, init)
    if (payload.role !== 'ADMIN') return json(400, { error: { code: 'INVALID', message: '역할을 확인해 주세요' } })
    const target = record.members.find((member) => member.userId === userId)
    if (!target) return json(404, { error: { code: 'NOT_FOUND', message: '담당자를 찾지 못했어요' } })
    for (const member of record.members) {
      if (member.userId === userId) member.role = 'ADMIN'
      else if (member.role === 'ADMIN') member.role = 'MEMBER'
    }
    const mine = record.members.find((member) => member.userId === currentUserId())
    if (mine) record.company.role = mine.role
    return new Response(null, { status: 204 })
  }
  if (method === 'GET' && tail === '/companies/me') {
    const company = companyMe()
    return company ? json(200, { data: company }) : json(404, { error: { code: 'COMPANY_NOT_FOUND', message: '회사를 찾지 못했어요' } })
  }
  if (method === 'PATCH' && tail === '/companies/me') {
    const record = companyRecord()
    if (!record) return json(404, { error: { code: 'COMPANY_NOT_FOUND', message: '회사를 찾지 못했어요' } })
    if (record.company.role !== 'ADMIN') return adminOnly()
    const payload = await readJson(input, init)
    const keys = ['legalName', 'representativeName', 'industry', 'website', 'intro', 'logoKey'] as const
    for (const key of keys) {
      const value = payload[key]
      if (key in payload) record.company[key] = typeof value === 'string' && value.trim() ? value.trim() : null
    }
    if ('logoKey' in payload) record.company.logoUrl = record.company.logoKey ? `/api/v1/uploads/images/${record.company.logoKey}` : null
    return json(200, { data: record.company })
  }
  if (method === 'DELETE' && tail === '/me') {
    const kind = mockPersona()
    if (kind === 'employer' || kind === 'employer-pro' || kind === 'employer-ultra') {
      return json(409, { error: { code: 'ADMIN_TRANSFER_REQUIRED', message: '관리자를 넘겨 주세요' } })
    }
    return new Response(null, { status: 204 })
  }
  return null
}
