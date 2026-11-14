import { JOB_POLL_MS } from '@push/api-client'

const FIT_PARTS = [
  ['techStack', '기술 스택'],
  ['experienceLink', '경험 연관성'],
  ['careerLevel', '경력 수준'],
  ['keyword', '키워드'],
  ['domain', '도메인'],
] as const

export const FIT_PART_LABELS = FIT_PARTS.map((part) => part[1])
// JobDetail draws all five parts; only the JobFit waiting card draws these three dashes.
const WAITING_FIT_LABELS: readonly string[] = ['기술 스택', '경험 연관성', '키워드']
export const WAITING_FIT_PARTS = FIT_PART_LABELS.filter((label) => WAITING_FIT_LABELS.includes(label)).map((label) => ({ label, value: null }))

// MyBookmarkJob draws the three waiting-card parts with the score; JobDetail draws all five.
export const bookmarkFitParts = <T extends { label: string }>(parts: T[]) => parts.filter((part) => WAITING_FIT_LABELS.includes(part.label))

export const FIT_LOCK = 'PRO로 올리면 항목별 점수와 약점을 볼 수 있어요'
export const FIT_LOCK_CLOSED = '항목별 점수와 약점은 PRO에서 볼 수 있어요'
export const FIT_SOON = '적합도는 곧 볼 수 있어요'
export const FIT_COMPARING = '공고와 서류를 비교하는 중…'

// Same rule as fo-mobile: no upgrade invitation while payments are closed or not loaded yet.
export const fitLockText = (paymentsOpen: boolean) => (paymentsOpen ? FIT_LOCK : FIT_LOCK_CLOSED)

export type FitPayload = {
  fitScore: number
  parts: Record<(typeof FIT_PARTS)[number][0], number>
  topGap: string
  plan: string
  reachable?: number
}

// The blurred rows behind the FREE lock pill (JobDetail FREE boards): decoration only, the server sends no part scores to a FREE account.
export const FIT_LOCK_PREVIEW = {
  parts: [7.5, 7, 8, 4.5, 5],
  weakness: 'Kafka 운영 경험과 부하 테스트 근거가 부족해요',
} as const

export type FitCardModel = {
  document: string
  score: number
  parts: { label: string; value: number | null }[]
  weakness: string | null
  locked: boolean
  reachable?: number
  /** ULTRA draws the `이렇게 고치면 N점대` row under the card (JobDetail ULTRA boards). */
  ultra?: boolean
}

type FitClient = {
  listDocuments: () => Promise<{ data: { id: string; title: string }[] }>
  startFit: (postingId: string, documentId: string) => Promise<{ jobId: string }>
  readJob: (id: string) => Promise<{ status: string; result: FitPayload | null }>
}

export const planOf = (plan: string | undefined) => (plan === 'PRO' || plan === 'ULTRA' ? plan : 'FREE')

const reachableBand = ({ fitScore, reachable }: FitPayload) =>
  reachable != null && Math.floor(reachable) > Math.floor(fitScore) ? Math.floor(reachable) : undefined

export const fitCardModel = (payload: FitPayload, document: string): FitCardModel => {
  const locked = planOf(payload.plan) === 'FREE'
  return {
    document,
    score: payload.fitScore,
    locked,
    weakness: locked ? null : payload.topGap || null,
    reachable: locked ? undefined : reachableBand(payload),
    ultra: planOf(payload.plan) === 'ULTRA',
    parts: FIT_PARTS.map(([key, label]) => ({
      label,
      value: locked ? null : payload.parts[key],
    })),
  }
}

type MockFit = { document: string; score: number; parts: { label: string; value: number }[]; weakness: string; reachable: number }

/** The WebView mock answers like the server for the plan the app tells it (`window.__PUSH__.plan`, PRO when absent). */
export const mockFitModel = (fit: MockFit, plan: string | undefined): FitCardModel =>
  fitCardModel(
    {
      fitScore: fit.score,
      parts: Object.fromEntries(FIT_PARTS.map(([key, label]) => [key, fit.parts.find((part) => part.label === label)?.value ?? 0])) as FitPayload['parts'],
      topGap: fit.weakness,
      plan: plan ?? 'PRO',
      reachable: fit.reachable,
    },
    fit.document,
  )

const settled = new Set(['DONE', 'FAILED', 'DEAD', 'CANCELLED'])

export type FitDocument = { id: string; title: string }

export const firstDocument = async (client: Pick<FitClient, 'listDocuments'>): Promise<FitDocument | null> => {
  try {
    const page = await client.listDocuments()
    return page.data[0] ?? null
  } catch {
    return null
  }
}

export const runPostingFit = async (
  postingId: string,
  doc: FitDocument,
  client: Omit<FitClient, 'listDocuments'>,
  sleep: (ms: number) => Promise<void> = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
): Promise<FitCardModel | null> => {
  try {
    const { jobId } = await client.startFit(postingId, doc.id)
    for (;;) {
      const job = await client.readJob(jobId)
      if (job.status === 'DONE') return job.result ? fitCardModel(job.result, doc.title) : null
      if (settled.has(job.status)) return null
      await sleep(JOB_POLL_MS)
    }
  } catch {
    return null
  }
}

export type FitStatus = 'comparing' | 'soon' | 'locked' | 'ready'

export const fitStatus = (state: {
  documentPending: boolean
  document: FitDocument | null | undefined
  fitPending: boolean
  fit: FitCardModel | null | undefined
}): FitStatus => {
  if (state.documentPending) return 'comparing'
  if (!state.document) return 'soon'
  if (state.fitPending) return 'comparing'
  if (!state.fit) return 'soon'
  return state.fit.locked ? 'locked' : 'ready'
}
