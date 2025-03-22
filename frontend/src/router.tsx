import { createHashRouter } from 'react-router-dom';
import Layout from './views/Layout.tsx'
import Welcome from './views/Welcome.tsx'

export const router = createHashRouter([
	{
		path: "/",
		element: <Layout />,
		children: [
			{
				index: true,
				element: <Welcome />
			}
		]


	}

])
