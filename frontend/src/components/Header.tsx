import React from "react"
import { useAtom, useSetAtom } from "jotai"
import { sidebarVisibleAtom, toggleSidebarAtom } from "../atoms/sidebarState"
import { useTranslation } from "react-i18next"
import { keymapModalVisibleAtom } from "../atoms/modalState"
import ModelSelect from "./ModelSelect"

type Props = {
  showHelpButton?: boolean
  showModelSelect?: boolean
}

const Header = ({ showHelpButton = false, showModelSelect = false }: Props) => {
  const toggleSidebar = useSetAtom(toggleSidebarAtom)
  const { t } = useTranslation()
  const setKeymapModalVisible = useSetAtom(keymapModalVisibleAtom)
  const [isSidebarVisible] = useAtom(sidebarVisibleAtom)

  const onClose = () => {
    toggleSidebar()
  }

  return (
    <div className={`app-header ${isSidebarVisible ? "sidebar-visible" : ""}`}>
      <div className="header-content">
        <div className="left-side">
          <div className="menu-container">

            <h1>{t("header.title")}</h1>
            {showModelSelect && <ModelSelect />}
          </div>
        </div>
        <span></span>

      </div>
    </div>
  )
}

export default React.memo(Header) 