import { defineStore } from 'pinia'
import { ApiClient } from '../services/apiClient'
import { useNotificationStore } from './notifications'
import { useUsersStore } from './users'

export const useLeavesStore = defineStore('leaves', {
  state: () => ({
    records: [],
    isLoading: false
  }),
  actions: {
    async fetchLeaves() {
      this.isLoading = true
      const data = await ApiClient.get('hr_leaves')
      if (data) {
        this.records = data.map(leave => {
          const record = {
            id: leave.id,
            requesterId: leave.user_id,
            type: 'full-day',
            date: leave.start_date,
            status: leave.status,
            reason: leave.reason
          }
          try {
            const parsed = JSON.parse(leave.reason)
            if (parsed.isJson) {
              record.reason = parsed.reason
              record.type = parsed.type || 'full-day'
              record.targetTeacherId = parsed.targetTeacherId
              record.period = parsed.period
              record.requesterRole = parsed.requesterRole
            }
          } catch (e) {}
          return record
        })
      }
      this.isLoading = false
    },
    async requestLeave(payload) {
      const usersStore = useUsersStore()
      const requester = usersStore.users.find(u => u.id === payload.requesterId)
      
      const dbPayload = {
        user_id: payload.requesterId,
        // role is NOT NULL on hr_leaves - this was previously missing and
        // silently broke every single leave request insert.
        role: payload.requesterRole || requester?.role || 'unknown',
        // hr_leaves has NO 'type' column at all - it must be embedded in
        // the JSON-encoded reason (like targetTeacherId/period below),
        // not sent as a top-level field, or the insert is rejected.
        start_date: payload.date,
        end_date: payload.date,
        reason: JSON.stringify({
          isJson: true,
          reason: payload.reason,
          type: payload.type || 'full-day',
          targetTeacherId: payload.targetTeacherId,
          period: payload.period,
          requesterRole: payload.requesterRole
        }),
        status: 'pending'
      }

      const res = await ApiClient.post('hr_leaves', dbPayload)
      if (res && res.success) {
        this.records.push({
          id: res.data.id,
          ...payload,
          status: 'pending'
        })
        const notifStore = useNotificationStore()
        if (payload.type === 'full-day' || payload.requesterRole === 'teacher') {
          notifStore.addNotification('info', `New leave request from ${requester?.name || 'User'}`, 'hod')
        } else if (payload.type === 'class' && payload.targetTeacherId) {
          notifStore.addNotification('info', `New class leave request from ${requester?.name || 'Student'}`, 'teacher')
        }
      } else {
        console.error('Failed to submit leave request', res?.error)
        throw new Error(res?.error?.message || 'Failed to submit leave request')
      }
    },
    async updateLeaveStatus(id, newStatus) {
      const leave = this.records.find(r => r.id === id)
      if (leave) {
        const res = await ApiClient.put('hr_leaves', id, { status: newStatus })
        if (res && res.success) {
          leave.status = newStatus
          const notifStore = useNotificationStore()
          notifStore.addNotification(
            newStatus === 'approved' ? 'success' : 'warning', 
            `Your leave request for ${leave.date} was ${newStatus}`, 
            leave.requesterRole
          )
        } else {
          console.error('Failed to update leave status', res?.error)
          throw new Error(res?.error?.message || 'Failed to update leave status')
        }
      }
    }
  }
})
