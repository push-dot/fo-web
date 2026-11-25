import type { ApplicantAiReview, ApplicantInterviewKit } from '@push/api-client'
import { Link } from 'react-router-dom'
import { dateLabel } from '../../../shared/lib/format'
import { AI_PANEL } from '../constants'

type Props = { review: ApplicantAiReview | null; kit: ApplicantInterviewKit | null }

const ApplicantAi = ({ review, kit }: Props) => {
  if (!review && !kit) return null
  const checks = review?.flags.filter((flag) => flag.level === 'CHECK') ?? []
  return (
    <div className="stack applicant-ai">
      {review ? (
        <section className="stack" aria-label={AI_PANEL.review}>
          <span className="b2 w7">
            {AI_PANEL.review} <span className="c1 t3">{dateLabel(review.createdAt)}</span>
          </span>
          {checks.length ? (
            <>
              <span className="c1 t3 w7">{AI_PANEL.check}</span>
              <ul className="stack">
                {checks.map((flag) => (
                  <li key={flag.title} className="b2">
                    <span className="w7">{flag.title}</span>
                    <span className="c1 t3 block">{flag.reason}</span>
                    {flag.quote ? <q className="c1 t3 block">{flag.quote}</q> : null}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="c1 t3">{AI_PANEL.none}</p>
          )}
          <p className="c1 t3">{AI_PANEL.disclaimer}</p>
          <Link className="c1 w7" to={`/employer/chat/${review.conversationId}`}>
            {AI_PANEL.open}
          </Link>
        </section>
      ) : null}
      {kit ? (
        <section className="stack" aria-label={AI_PANEL.kit}>
          <span className="b2 w7">
            {AI_PANEL.kitCount(kit.questions.length)} <span className="c1 t3">{dateLabel(kit.createdAt)}</span>
          </span>
          <ol className="stack">
            {kit.questions.map((question, index) => (
              <li key={`${index}-${question.text}`} className="b2">
                {index + 1}. {question.text}
                <span className="c1 t3 block">
                  {AI_PANEL.verify} · {question.verify}
                </span>
              </li>
            ))}
          </ol>
          <Link className="c1 w7" to={`/employer/chat/${kit.conversationId}`}>
            {AI_PANEL.open}
          </Link>
        </section>
      ) : null}
    </div>
  )
}

export default ApplicantAi
