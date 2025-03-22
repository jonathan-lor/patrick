import React, { forwardRef } from "react"

const WrappedTextarea = forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>((props, ref) => {
	const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (!e.altKey && !e.ctrlKey && !e.metaKey) {
			e.stopPropagation()
		}

		if (props.onKeyDown) {
			props.onKeyDown(e)
		}
	}

	return (
		<textarea
			{...props}
			ref={ref}
			onKeyDown={onKeyDown}
			className ="text-black border border-black rounded-2xl p-1 w-[33%]"
		/>
	)
})

WrappedTextarea.displayName = "WrappedTextarea"

export default React.memo(WrappedTextarea)
