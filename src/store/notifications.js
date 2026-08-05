import { defineStore } from 'pinia'
import { ApiClient } from '../services/apiClient'
import { useAuthStore } from './auth'

function timeAgo(timestamp) {
  if (!timestamp) return 'Just now'
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
}

function normalize(n) {
  if (!n) return n
  return {
    id: n.id,
    type: n.type,
    message: n.message,
    targetRole: n.target_role,
    targetUserId: n.target_user_id,
    rawTime: n.time,
    time: timeAgo(n.time)
  }
}

// This store used to be entirely in-memory (a hardcoded array that reset
// on every page load), even though a real `notifications` table already
// existed in Supabase. That meant a notification created for the HOD in
// the teacher's browser session was never visible in the HOD's own
// session. It's now fully backed by Supabase like every other store.
export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    alerts: [],
    isLoading: false
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
    async fetchNotifications() {
      this.isLoading = true
      const data = await ApiClient.get('notifications')
      if (data) {
        this.alerts = data
          .map(normalize)
          .sort((a, b) => new Date(b.rawTime || 0) - new Date(a.rawTime || 0))
      }
      this.isLoading = false
    },
    async addNotification(type, message, targetRole = null, time = null, targetUserId = null) {
      const payload = {
        type,
        message,
        target_role: targetRole,
        target_user_id: targetUserId
      }
      const res = await ApiClient.post('notifications', payload)
      if (res && res.success) {
        this.alerts.unshift(normalize(res.data))
      } else {
        console.error('Failed to save notification', res?.error)
      }
    },
    async clearNotifications() {
      const idsToClear = this.myAlerts.map(a => a.id)
      for (const id of idsToClear) {
        const res = await ApiClient.delete('notifications', id)
        if (res && res.success) {
          this.alerts = this.alerts.filter(a => a.id !== id)
        }
      }
    }
  }
})
