const ChatSay = ({ text, soft }: { text: string; soft?: boolean }) => (
  <div className="chat-say">
    <span className="ai-dot ac" aria-hidden="true" />
    <div className={soft ? 'b1 t2' : 'b1'}>{text}</div>
  </div>
)

export default ChatSay
