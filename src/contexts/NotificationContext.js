"use client"

import { createContext, useContext, useState } from "react"
import notificationService from "../services/notificationService"

const NotificationContext = createContext()

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications debe ser usado dentro de NotificationProvider")
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])

  const addNotification = (notification) => {
    const newNotification = notificationService.addNotification(notification)
    setNotifications(notificationService.getNotifications())
    return newNotification
  }

  const markAsRead = (notificationId) => {
    notificationService.markAsRead(notificationId)
    setNotifications(notificationService.getNotifications())
  }

  const clearAll = () => {
    notificationService.clearAll()
    setNotifications([])
  }

  const getUnreadCount = () => {
    return notificationService.getUnreadCount()
  }

  const value = {
    notifications,
    addNotification,
    markAsRead,
    clearAll,
    getUnreadCount,
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}
