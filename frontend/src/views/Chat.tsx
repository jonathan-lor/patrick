import React, { useState } from 'react'
import MessagesBox from '../components/MessagesBox'
import WrappedTextarea from '../components/TextArea' 
// or: import ChatInput from '../components/ChatInput'

interface Message {
  text: string
  timestamp: string
  user: boolean
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Don’t add empty messages
    if (!message.trim()) return

    const newMsg: Message = {
      text: message,
      timestamp: new Date().toISOString(),
      user: true,
    }

    // Add new message to the conversation
    setMessages([...messages, newMsg])
    // Reset text area
    setMessage('')
  }

  return (
    <div>
      {/* The message list */}
      <MessagesBox messages={messages} />

      {/* The chat input area */}
      <form onSubmit={handleSubmit} className="mt-4">
        <WrappedTextarea
          rows={2}
          value={message}
          onChange={e => setMessage(e.target.value)}
			className="text-black"
        />
        <button type="submit" className="text-black ml-3 border border-black rounded-2xl p-1 bg-green-200">
          Send
        </button>
      </form>
    </div>
  )
}

export default Chat

