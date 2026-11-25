import { useNavigate } from 'react-router-dom'
import { NOT_FOUND } from '../pages/not-found/constants'
import PageState from '../shared/ui/page-state'

const WebViewNotFound = () => {
  const navigate = useNavigate()
  return (
    <PageState
      top={<span className="nf-code num">404</span>}
      title={NOT_FOUND.title}
      body={NOT_FOUND.body}
    >
      <button type="button" className="btn pri" onClick={() => navigate(-1)}>
        {NOT_FOUND.back}
      </button>
    </PageState>
  )
}

export default WebViewNotFound
