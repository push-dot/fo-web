import { useParams } from 'react-router-dom'
import { ChatRoom } from '../../features/chat'

const ChatThreadPage = () => {
  const { id = '' } = useParams()
  return <ChatRoom key={id} id={id} screen="thread" />
}

export default ChatThreadPage
