import React from 'react'
import Chat from './Chat.tsx'


const Welcome = () => {
	return (
	<>
		<h1>welcome</h1>
			<Chat />
		</>
	)
}

export default React.memo(Welcome)
