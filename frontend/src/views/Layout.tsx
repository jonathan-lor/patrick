import Header from '../components/Header.tsx'
import { Outlet } from "react-router-dom"
import React from 'react'

const Layout = () => {
	return (
		<>
			<Header />
			<Outlet />
	</>)
}

export default React.memo(Layout)
