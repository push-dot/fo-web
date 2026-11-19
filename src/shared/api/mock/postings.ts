import { TERMINAL_APPLICANT_STAGES, applicantCounts, applicantDetail, applicantSummary, applicantsByPosting, applyPostingPatch, asEmploymentType, asJobCategory, asStage, careerMinOf, companyPosting, companyPostings, deadlineOf, employerOwnsPostings, json, listings, ownedPostingResponse, pageOf, present, readJson, recordOf, revisionConflict, routeTail, signedOf, slicePage, stringList, syncListing, toCard, bumpCompanyPostingSeq, companyPostingSeq } from './core'

export const handleEmployerPostings = async (method: string, url: URL, pathname: string, input: RequestInfo | URL, init?: RequestInit) => {
  const tail = routeTail(pathname)
  if (method === 'GET' && tail === '/companies/me/postings') {
    const signed = signedOf(input, init)
    const items = employerOwnsPostings() ? companyPostings.map((item) => present(item, signed)) : []
    return json(200, pageOf(url, items))
  }
  if (method === 'POST' && tail === '/postings') {
    const payload = await readJson(input, init)
    bumpCompanyPostingSeq()
    const created = companyPosting({
      id: `job-${companyPostingSeq}`,
      title: String(payload.title ?? ''),
      jobCategory: asJobCategory(payload.jobCategory),
      careerMin: careerMinOf(payload.careerMin),
      careerMax: typeof payload.careerMax === 'number' ? payload.careerMax : null,
      location: String(payload.location ?? ''),
      employmentType: asEmploymentType(payload.employmentType),
      deadline: deadlineOf(payload.deadline),
      description: String(payload.description ?? ''),
      requirements: stringList(payload.requirements),
      preferred: stringList(payload.preferred),
      workConditions: recordOf(payload.workConditions),
      skills: stringList(payload.skills),
      createdAt: new Date().toISOString(),
      revision: 1,
      closedAt: null,
      company: '모아페이',
      status: payload.status === 'DRAFT' ? 'DRAFT' : 'OPEN',
      draftSource: payload.draftSource === 'AGENT' || payload.draftSource === 'MANUAL' ? payload.draftSource : null,
      createdBy: { displayName: '이민아' },
    })
    companyPostings.unshift(created)
    if (created.status === 'OPEN') listings.unshift(toCard(created))
    return json(201, { data: created })
  }
  const applicantMatch = tail.match(/^\/postings\/([^/]+)\/applicants\/([^/]+)$/)
  if (applicantMatch && (method === 'GET' || method === 'PATCH')) {
    const postingId = decodeURIComponent(applicantMatch[1] ?? '')
    const applicationId = decodeURIComponent(applicantMatch[2] ?? '')
    const record = (applicantsByPosting.get(postingId) ?? []).find((item) => item.application.id === applicationId)
    if (!record) return json(404, { error: { code: 'NOT_FOUND', message: '지원자를 찾지 못했어요' } })
    if (method === 'PATCH') {
      if (TERMINAL_APPLICANT_STAGES.has(record.application.stage)) {
        return json(409, { error: { code: 'INVALID_TRANSITION', message: '이미 끝난 지원이에요' } })
      }
      const payload = await readJson(input, init)
      const stage = asStage(payload.stage)
      if (stage) record.application.stage = stage
      return json(200, { data: record.application })
    }
    record.seen = true
    return json(200, { data: applicantDetail(record) })
  }
  const fileMatch = tail.match(/^\/postings\/([^/]+)\/applicants\/([^/]+)\/files\/([^/]+)$/)
  if (fileMatch && method === 'GET') {
    const [, postingId = '', applicationId = '', fileId = ''] = fileMatch.map(decodeURIComponent)
    const record = (applicantsByPosting.get(postingId) ?? []).find((item) => item.application.id === applicationId)
    const file = record ? applicantDetail(record).files.find((item) => item.id === fileId) : undefined
    if (!file) return json(404, { error: { code: 'NOT_FOUND', message: '파일을 찾지 못했어요' } })
    return new Response(new Blob([`%PDF-1.4 mock ${file.fileName}`], { type: file.mimeType }), {
      status: 200,
      headers: { 'content-type': file.mimeType, 'content-disposition': `attachment; filename*=UTF-8''${encodeURIComponent(file.fileName)}` },
    })
  }
  const countsMatch = tail.match(/^\/postings\/([^/]+)\/applicant-counts$/)
  if (countsMatch && method === 'GET') return json(200, { data: applicantCounts(decodeURIComponent(countsMatch[1] ?? '')) })
  const applicantsMatch = tail.match(/^\/postings\/([^/]+)\/applicants$/)
  if (applicantsMatch && method === 'GET') {
    const postingId = decodeURIComponent(applicantsMatch[1] ?? '')
    const stage = url.searchParams.get('stage')
    const records = (applicantsByPosting.get(postingId) ?? []).filter((item) => !stage || item.application.stage === stage)
    return json(200, slicePage(url, records.map(applicantSummary), (item) => item.applicationId))
  }
  const closeMatch = tail.match(/^\/postings\/([^/]+)\/close$/)
  if (closeMatch && method === 'POST') {
    const id = decodeURIComponent(closeMatch[1] ?? '')
    const found = companyPostings.find((item) => item.id === id)
    if (!found) return json(404, { error: { code: 'NOT_FOUND', message: '공고를 찾지 못했어요' } })
    const payload = await readJson(input, init)
    if (payload.expectedRevision !== found.revision) return revisionConflict(found.revision)
    found.closedAt = new Date().toISOString()
    found.status = 'CLOSED'
    found.revision += 1
    syncListing(found)
    return json(200, { data: found })
  }
  const patchMatch = tail.match(/^\/postings\/([^/]+)$/)
  if (patchMatch && method === 'PATCH') {
    const id = decodeURIComponent(patchMatch[1] ?? '')
    const found = companyPostings.find((item) => item.id === id)
    if (!found) return json(404, { error: { code: 'NOT_FOUND', message: '공고를 찾지 못했어요' } })
    const payload = await readJson(input, init)
    if (payload.expectedRevision !== found.revision) return revisionConflict(found.revision)
    applyPostingPatch(found, payload)
    if (!found.closedAt && (payload.status === 'DRAFT' || payload.status === 'OPEN')) {
      if (found.status === 'DRAFT' && payload.status === 'OPEN') listings.unshift(toCard(found))
      found.status = payload.status
    }
    syncListing(found)
    return json(200, { data: found })
  }
  const detailMatch = tail.match(/^\/postings\/([^/]+)$/)
  if (detailMatch && method === 'GET') {
    const owned = ownedPostingResponse(decodeURIComponent(detailMatch[1] ?? ''))
    if (owned) return owned
  }
  return null
}
