import { useParams } from 'react-router-dom'

import { OfferInbox } from '../../features/offers'

const OffersPage = () => {
  const { id } = useParams()
  return <OfferInbox selectedId={id} />
}

export default OffersPage
