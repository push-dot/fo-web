import { EMPLOYMENT_TYPES, workConditionLines, FitCard, BrowserPosting, PostingActions, postingsGet, postingTitleLines } from '../../features/postings'
import { brandColor, careerLabel } from '@push/shared'
import { Fragment } from 'react'
import { useParams } from 'react-router-dom'
import { assetUrl } from '../../shared/api/client'
import { isWebView } from '../../shared/lib/bridge'
import { dDay } from '../../shared/lib/format'
import type { PostingView } from '../../shared/api/mock'
import { showFitCard } from '../../features/postings'
import Toast, { useToast } from '../../shared/ui/toast'
import { useDetail } from '../../shared/lib/use-detail'
import MidDotText from '../../shared/ui/mid-dot-text'
import Section from '../../shared/ui/section'
import Status from '../../shared/ui/status'

const PostingPage = () => {
  const { id = '' } = useParams()
  const toast = useToast()
  const { data: p, error } = useDetail(['posting', id], () => postingsGet(id) as Promise<PostingView>, (item) => item.company)
  if (!p) return <Status error={!!error} what="공고" />
  if (!isWebView()) return <BrowserPosting posting={p} message={toast.message} onToast={toast.show} />
  const dday = dDay(p.deadline)
  const career = careerLabel(p)
  const duties = p.description.split('\n').map((s) => s.trim()).filter(Boolean)
  return (
    <main className="page wv posting-wv">
      <PostingActions posting={p} onToast={toast.show} />
      <header className="head">
        <div className="company">
          {p.imageUrl ? (
            <img className="logo" src={assetUrl(p.imageUrl)} alt="" />
          ) : (
            <div className="logo" style={{ background: brandColor(p.company) }} aria-hidden="true">
              {[...p.company][0]}
            </div>
          )}
          <span className="b2 w7">{p.company}</span>
          {p.industry ? <span className="c1 t3">{p.industry}</span> : null}
        </div>
        <h1 className="h1">
          {postingTitleLines(p.title).map((line, i) => (
            <Fragment key={line}>
              {i > 0 ? <br /> : null}
              <MidDotText text={line} />
            </Fragment>
          ))}
        </h1>
        <div className="badges">
          {dday ? <span className="badge grey">{dday}</span> : null}
          <span className="badge grey">{p.location}</span>
          <span className="badge grey">{career === '신입' ? career : `경력 ${career}`}</span>
          <span className="badge grey">{EMPLOYMENT_TYPES.find((t) => t.key === p.employmentType)?.label}</span>
        </div>
      </header>
      {showFitCard(isWebView()) ? <FitCard postingId={p.id} /> : null}
      <Section title="하는 일" items={duties} />
      <Section title="자격 요건" items={p.requirements} />
      <Section title="우대 사항" items={p.preferred ?? []} />
      <Section title="근무 조건" items={workConditionLines(p.workConditions)} />
      <Toast message={toast.message} />
    </main>
  )
}

export default PostingPage
