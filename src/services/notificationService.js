class NotificationService {
  constructor() {
    this.notifications = []
  }

  addNotification(notification) {
    const newNotification = {
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
      ...notification,
    }

    this.notifications.unshift(newNotification)
    return newNotification
  }

  getNotifications() {
    return this.notifications
  }

  markAsRead(notificationId) {
    const notification = this.notifications.find((n) => n.id === notificationId)
    if (notification) {
      notification.read = true
    }
  }

  getUnreadCount() {
    return this.notifications.filter((n) => !n.read).length
  }

  clearAll() {
    this.notifications = []
  }
}

export default new NotificationService()
