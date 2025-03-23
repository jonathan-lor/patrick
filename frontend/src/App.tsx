import { RouterProvider } from "react-router-dom"
import { router } from "./router"
import { useSetAtom } from 'jotai'
import { loadConfigAtom } from './atoms/configState'
import { useEffect, useState } from "react"
import { handleGlobalHotkey, loadHotkeyMapAtom } from "./atoms/hotkeyState"
import { systemThemeAtom } from "./atoms/themeState"
import Updater from "./updater"

function App() {
  const [loading, setLoading] = useState(true)
  const loadConfig = useSetAtom(loadConfigAtom)
  const loadHotkeyMap = useSetAtom(loadHotkeyMapAtom)
  const setSystemTheme = useSetAtom(systemThemeAtom)

  // init app
  useEffect(() => {
    loadHotkeyMap()
    loadConfig().finally(() => {
      setLoading(false)
      window.postMessage({ payload: "removeLoading" }, "*")
    })

    window.addEventListener("keydown", handleGlobalHotkey)
    return () => {
      window.removeEventListener("keydown", handleGlobalHotkey)
    }
  }, [])

  // set system theme
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = () => {
      setSystemTheme(mediaQuery.matches ? "dark" : "light")
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [])

  if (loading) {
    return <></>
  }

  return (
    <>
      <RouterProvider router={router} />
      <Updater />
    </>
  )
}

export default App
