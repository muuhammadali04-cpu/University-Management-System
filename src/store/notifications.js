import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    alerts: [
      { id: 1, type: 'Alert', message: 'Jane Doe has requested to borrow "Clean Code".', targetRole: 'librarian', targetUserId: null, time: '2 hours ago' },
      { id: 2, type: 'System', message: 'Prof. Johnson has suggested a new book: "Artificial Intelligence: A Modern Approach".', targetRole: 'librarian', targetUserId: null, time: '1 day ago' }
    ]
  }),
  getters: {
    myAlerts: (state) => {
      const auth = useAuthStore()
      if (!auth.user) return []
      return state.alerts.filter(a => {
        
        if (a.targetUserId && a.targetUserId !== auth.user.id) return false
        
        if (a.targetRole && a.targetRole !== auth.user.role) return false
        return true
      })
    },
    unreadCount() {
      return this.myAlerts.length
    }
  },
  actions: {
    addNotification(type, message, targetRole = null, time = 'Just now', targetUserId = null) {
      this.alerts.unshift({ id: Date.now(), type, message, targetRole, targetUserId, time })
    },
    clearNotifications() {
      const auth = useAuthStore()
      if (!auth.user) {
        this.alerts = []
        return
      }
      this.alerts = this.alerts.filter(a => {
        if (a.targetUserId && a.targetUserId === auth.user.id) return false
        if (a.targetRole && a.targetRole === auth.user.role) return false
        return true
      })
    }
  }
})
