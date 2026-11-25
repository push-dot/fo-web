import type { Profile } from '@push/api-client'
import { CAREER_STATUSES } from '../api'
import { brandColor } from '@push/shared'
import { Link } from 'react-router-dom'
import { careerStatusTone } from '../../profile'
import { initials } from '../../../shared/lib/format'
import Highlight from './highlight'

const PersonRow = ({ person, q }: { person: Profile; q: string }) => {
  const status = CAREER_STATUSES.find((item) => item.key === person.careerStatus)?.label
  const tone = careerStatusTone(person.careerStatus)
  return (
    <Link to={`/profiles/${person.userId}`} className="search-row person">
      <span className="ph" style={{ background: brandColor(person.displayName) }}>
        {initials(person.displayName)}
      </span>
      <span className="search-copy">
        <span className="hub-name">
          <span className="b1 w7">
            <Highlight text={person.displayName} query={q} />
          </span>
          {status ? <span className={`badge ${tone}`}>{status}</span> : null}
        </span>
        <span className="c1 t3">
          <Highlight text={person.headline} query={q} />
        </span>
      </span>
    </Link>
  )
}

export default PersonRow
