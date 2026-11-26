import { Link } from 'react-router-dom'
import { useMyCompany } from '../../company'
import { textFromConditions } from '../../postings'
import type { PostingDraft } from '../utils/employer-chat'
import Icon from '../../../shared/ui/icon'
import { DRAFT_EDIT, DRAFT_HEAD, DRAFT_REDO, draftMeta } from '../utils/chat-copy'
import { useChatActions } from '../hooks'
import { DRAFT_BADGE, DRAFT_NEW_POSTING, DRAFT_POSTING, DRAFT_SAME_POSTING } from '../constants'

const lines = (value: string) =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

const ChatDraftCard = ({ draft, postingId }: { draft: PostingDraft; postingId?: string }) => {
  const actions = useChatActions()
  const meta = draftMeta(draft, useMyCompany().data?.name)
  const same = postingId ? undefined : actions.posting
  const { employmentType: _, ...conditions } = draft.workConditions
  const groups = [
    ['하는 일', lines(draft.description)],
    ['자격 요건', draft.requirements],
    ['우대 사항', draft.preferred],
    ['근무 조건', lines(textFromConditions(conditions))],
  ] as const
  return (
    <div className="box draft-card">
      <div className="draft-head">
        <Icon name="doc" size={20} className="ac" />
        <span className="b2 w7">{DRAFT_HEAD}</span>
        <span className="badge orange">{DRAFT_BADGE}</span>
      </div>
      <div className="draft-body">
        <div className="draft-title">
          <span className="h2">{draft.title}</span>
          {meta ? <span className="b2 t3">{meta}</span> : null}
        </div>
        {groups.map(([label, items]) =>
          items.length === 0 ? null : (
            <div key={label} className="draft-group">
              <span className="sect">{label}</span>
              <ul className="b2 t2">
                {items.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            </div>
          ),
        )}
      </div>
      <div className="draft-foot">
        <button type="button" className="btn sec sm" onClick={actions.focus}>
          <Icon name="pencil" size={15} width={2.2} />
          {DRAFT_EDIT}
        </button>
        <button
          type="button"
          className="btn sec sm"
          disabled={actions.busy}
          onClick={actions.redraft}
        >
          <Icon name="retry" size={15} width={2.2} />
          {DRAFT_REDO}
        </button>
        <span className="chat-compose-gap" />
        {same ? (
          <>
            <Link className="btn sec sm" to="/employer/postings/new" state={draft}>
              {DRAFT_NEW_POSTING}
            </Link>
            <Link className="btn pri sm" to={`/employer/postings/${same.id}/edit`} state={draft}>
              {DRAFT_SAME_POSTING}
            </Link>
          </>
        ) : (
          <Link
            className="btn pri sm"
            to={postingId ? `/employer/postings/${postingId}/edit` : '/employer/postings/new'}
            state={postingId ? undefined : draft}
          >
            {DRAFT_POSTING}
          </Link>
        )}
      </div>
    </div>
  )
}

export default ChatDraftCard
