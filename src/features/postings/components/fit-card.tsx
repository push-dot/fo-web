import { useQuery } from '@tanstack/react-query'
import { usePaymentsOpen } from '../../billing'
import { api } from '../../../shared/api/client'
import { loadMock } from '../../../shared/api/mock-loader'
import MidDotText from '../../../shared/ui/mid-dot-text'
import { isMock, isWebView, pushEnv, send, webViewFrom } from '../../../shared/lib/bridge'
import { MOCK_FIT_DELAY_MS } from '../constants'
import { FIT_COMPARING, FIT_TITLE, FIT_PART_LABELS, bookmarkFitParts, WAITING_FIT_PARTS, FIT_LOCK_EXAMPLE, FIT_SOON, firstDocument, fitLockText, fitStatus, isLowFit, mockFitModel, runPostingFit, type FitCardModel, type FitDocument, type FitPayload } from '../utils/fit-view'

const C = 2 * Math.PI * 27

const fitCardSubtitle = (
  status: ReturnType<typeof fitStatus>,
  fit: FitCardModel | null | undefined,
): string | null => {
  if (status === 'comparing') return FIT_COMPARING
  if (status === 'soon') return FIT_SOON
  return null
}

const loadMockFit = async (): Promise<FitCardModel> => {
  const [{ mockFit }] = await Promise.all([loadMock(), new Promise((resolve) => setTimeout(resolve, isWebView() ? 0 : MOCK_FIT_DELAY_MS))])
  const model = mockFitModel(mockFit, pushEnv().plan)
  return pushEnv().fitParts === 3 ? { ...model, parts: bookmarkFitParts(model.parts) } : model
}

const loadDocument = () =>
  isMock()
    ? loadMock().then(({ mockFit }) => ({ id: mockFit.document, title: mockFit.document }))
    : firstDocument({ listDocuments: () => api.documents.list({ kind: 'HUB_PROFILE', limit: 1 }) })

const loadFit = (postingId: string, doc: FitDocument) =>
  isMock()
    ? loadMockFit()
    : runPostingFit(postingId, doc, {
        startFit: (id, documentId) => api.postings.fit(id, documentId),
        readJob: (id) => api.jobs.get<FitPayload>(id),
      })

const FitRow = ({ label, value, index, example }: { label: string; value: number | null; index: number; example?: boolean }) => (
  <div className="frow">
    <span>{label}</span>
    <span className="bar">
      {value !== null ? (
        <i className={example ? 'ex' : isLowFit(value) ? 'lo' : undefined} style={{ width: `${value * 10}%`, animationDelay: `${0.15 + index * 0.08}s` }} />
      ) : null}
    </span>
    <b className={value !== null && !example ? 'num' : 'num t4'}>{value !== null && !example ? value.toFixed(1) : '–'}</b>
  </div>
)

const FitCard = ({ postingId }: { postingId: string }) => {
  const mock = isMock()
  const documentQuery = useQuery({ queryKey: ['fit-document', mock], queryFn: loadDocument, staleTime: Infinity })
  const doc = documentQuery.data
  const fitQuery = useQuery({
    queryKey: ['fit', postingId, doc?.id, mock],
    queryFn: () => loadFit(postingId, doc!),
    enabled: !!doc,
    staleTime: Infinity,
  })
  const fit = fitQuery.data
  const paymentsOpen = usePaymentsOpen()
  const status = fitStatus({ documentPending: documentQuery.isPending, document: doc, fitPending: fitQuery.isPending, fit })
  const subtitle = fitCardSubtitle(status, fit)
  const tappable = status === 'ready' || status === 'locked'
  const Root = tappable ? 'button' : 'div'
  return (
    <Root
      {...(tappable
        ? { type: 'button' as const, onClick: () => send({ type: 'open', path: `/chat?postingId=${encodeURIComponent(postingId)}` }) }
        : {})}
      className="fit"
      aria-busy={status === 'comparing'}
    >
      <div className="fit-head">
        {fit ? (
          <div className="ring">
            <svg viewBox="0 0 64 64" aria-hidden="true">
              <circle cx="32" cy="32" r="27" className="track" />
              <circle cx="32" cy="32" r="27" className="value" strokeDasharray={`${(fit.score / 10) * C} ${C}`} />
            </svg>
            <span className="num">{fit.score.toFixed(1)}</span>
          </div>
        ) : (
          <span className="ring ring-empty">{status === 'comparing' ? <span className="glyph" /> : <span className="num t4">–</span>}</span>
        )}
        <span className="fit-title">
          <span className="c1 t3 w7">
            <MidDotText text={FIT_TITLE} />
          </span>
          {subtitle ? <span className={status === 'comparing' ? 'h3 shim shim-ac' : 'h3'}>{subtitle}</span> : null}
        </span>
        {tappable ? (
          <svg className="ic fit-chev" viewBox="0 0 24 24" aria-hidden="true">
            <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />
          </svg>
        ) : null}
      </div>
      {status === 'locked' ? (
        <div className="fit-lock">
          <div className="fit-lock-rows" aria-hidden="true">
            {FIT_PART_LABELS.map((label, i) => (
              <FitRow key={label} label={label} value={FIT_LOCK_EXAMPLE[i] ?? null} index={i} example />
            ))}
          </div>
          <span className="fit-lock-pill">
            <span className="c1 w7">
              <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 10.5V8a5 5 0 0 1 10 0v2.5M5.5 10.5h13v10h-13Z" />
              </svg>
              {fitLockText(paymentsOpen)}
            </span>
          </span>
        </div>
      ) : (
        <>
          {(fit ? (webViewFrom() === 'bookmark' ? bookmarkFitParts(fit.parts) : fit.parts) : WAITING_FIT_PARTS).map(({ label, value }, i) => (
            <FitRow key={label} label={label} value={value} index={i} />
          ))}
          {fit?.weakness ? (
            <span className="c1 t2 weak">
              <span className="bang">!</span>
              {fit.weakness}
            </span>
          ) : null}
        </>
      )}
    </Root>
  )
}

export default FitCard
