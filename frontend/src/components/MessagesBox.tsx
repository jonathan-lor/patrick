import React from 'react'
import MessageBubble from './MessageBubble'

interface Message {
  text: string
  timestamp: string
  user: boolean
}

interface MessagesBoxProps {
  messages: Message[]
}

const MessagesBox: React.FC<MessagesBoxProps> = ({ messages }) => {
  return (
    <div className="flex flex-col mx-2 p-4 w-[98%] origin-center rounded-2xl border border-black h-auto bg-[#f6f6f6]">
      {messages.map((msg, idx) => (
        <MessageBubble key={idx} message={msg} />
      ))}
    </div>
  )
}

export default MessagesBox

