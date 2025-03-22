interface message {
		text: string,
		timestamp: string,
		user: boolean
	}

interface messageprop {
	message: message
}

const MessageBubble: React.FC<MessageProps> = ({message}) => {
	return(<>
		<div className={`flex ${message.user ? 'justify-end' : 'justify-start'}`}>
			{message.user && (
				<p className="p-3 m-1 rounded-3xl text-black text-right bg-blue-400 inline-block relative ">{message.text}</p>
			)
			
			
			}

			{!message.user && (
					<p className="p-3 m-1 rounded-3xl text-black text-right bg-gray-300 inline-block origin-left relative max-w-full">{message.text}</p>
			)}
			
		</div>
	</>)
}

export default MessageBubble
