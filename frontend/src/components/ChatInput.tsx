import React, { forwardRef } from 'react'

const ChatInput = forwardRef<HTMLInputElement, React.ComponentProps<"input">>((props, ref) => {

	return ( <input {...props} ref={ref} ) />
})

export default React.memo(ChatInput)

