import React, { useState, useCallback, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { sidebarVisibleAtom } from "../atoms/sidebarState"
import { historiesAtom, loadHistoriesAtom } from "../atoms/historyState"
import Header from "./Header"
import { useTranslation } from "react-i18next"
import { showToastAtom } from "../atoms/toastState"
import Tooltip from "./Tooltip"
import { closeAllOverlaysAtom, openOverlayAtom, OverlayType } from "../atoms/layerState"
import { useSidebarLayer } from "../hooks/useLayer"
import useHotkeyEvent from "../hooks/useHotkeyEvent"
import { currentChatIdAtom } from "../atoms/chatState"
import PopupConfirm from "./PopupConfirm"
import { newVersionAtom } from "../atoms/globalState"
import UpdateButton from "./UpdateButton"

interface Props {
  onNewChat?: () => void
}

interface DeleteConfirmProps {
  onConfirm: () => void
  onCancel: () => void
}

const DeleteConfirmModal: React.FC<DeleteConfirmProps> = ({ onConfirm, onCancel }) => {
  const { t } = useTranslation()
  const setCurrentChatId = useSetAtom(currentChatIdAtom)

  const _onConfirm = useCallback(() => {
    onConfirm()
    setCurrentChatId("")
  }, [onConfirm, setCurrentChatId])

  return (
    <PopupConfirm
      title={t("chat.confirmDelete")}
      confirmText={t("common.confirm")}
      cancelText={t("common.cancel")}
      onConfirm={_onConfirm}
      onCancel={onCancel}
      onClickOutside={onCancel}
      noBorder
      footerType="center"
      zIndex={1000}
    />
  )
}

const HistorySidebar = ({ onNewChat }: Props) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const histories = useAtomValue(historiesAtom)
  const loadHistories = useSetAtom(loadHistoriesAtom)
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null)
  const showToast = useSetAtom(showToastAtom)
  const _openOverlay = useSetAtom(openOverlayAtom)
  const newVersion = useAtomValue(newVersionAtom)
  const closeAllOverlays = useSetAtom(closeAllOverlaysAtom)
  const [isVisible, setVisible] = useSidebarLayer(sidebarVisibleAtom)
  const [currentChatId, setCurrentChatId] = useAtom(currentChatIdAtom)
  const containerRef = useRef<HTMLDivElement>(null)

  const openOverlay = useCallback((overlay: OverlayType) => {
    _openOverlay(overlay)
    setVisible(false)
  }, [_openOverlay, setVisible])

  useEffect(() => {
    if (isVisible) {
      loadHistories()
      containerRef.current?.focus()
    }
  }, [isVisible, loadHistories])

  useHotkeyEvent("chat:delete", () => {
    currentChatId && setDeletingChatId(currentChatId)
  })

  const confirmDelete = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation()
    setDeletingChatId(chatId)
  }

  const handleDelete = async () => {
    if (!deletingChatId)
      return

    try {
      const response = await fetch(`/api/chat/${deletingChatId}`, {
        method: "DELETE"
      })
      const data = await response.json()

      if (data.success) {
        showToast({
          message: t("chat.deleteSuccess"),
          type: "success"
        })

        if (location.pathname.includes(`/chat/${deletingChatId}`)) {
          navigate("/")
        }

        loadHistories()
      } else {
        showToast({
          message: t("chat.deleteFailed"),
          type: "error"
        })
      }
    } catch (error) {
      showToast({
        message: t("chat.deleteFailed"),
        type: "error"
      })
    } finally {
      setDeletingChatId(null)
    }
  }

  const loadChat = useCallback((chatId: string) => {
    setCurrentChatId(chatId)
    closeAllOverlays()
    navigate(`/chat/${chatId}`)
  }, [navigate])

  const handleNewChat = () => {
    setCurrentChatId("")
    setVisible(false)
    closeAllOverlays()
    if (onNewChat) {
      onNewChat()
    } else {
      navigate("/")
    }
  }

  const handleTools = () => {
    openOverlay("Tools")
  }

  const handleModels = () => {
    openOverlay("Model")
  }

  const handleSystem = () => {
    openOverlay("System")
  }

  const onBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (containerRef.current && !containerRef.current.contains(e.relatedTarget as Node)) {
      setVisible(false)
    }
  }

  return (

    <>
      <div className={`history-sidebar ${isVisible ? "visible" : ""}`} tabIndex={0} onBlur={onBlur} ref={containerRef}>
        <Header />
        <div className="history-header">
          <Tooltip
            content={`${t("chat.newChatTooltip")} Ctrl + Shift + O`}
          >
            <button className="new-chat-btn" onClick={handleNewChat}>
              + {t("chat.newChat")}
            </button>

          </Tooltip>
        </div>

		<div className="sidebar-footer">
          <button
            className="sidebar-footer-btn"
            onClick={handleTools}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
            </svg>
            {t("sidebar.tools")}
          </button>
		  </div>
		</div>

    </>

  )
}

export default React.memo(HistorySidebar)
