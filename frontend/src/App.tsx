import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/electron-vite.animate.svg'
import './App.css'
import { RouterProvider } from 'react-router-dom'
import { router }  from './router.tsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
		<RouterProvider router={router} />
			<h1>test</h1>
    </>
  )
}

export default App
