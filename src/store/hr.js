import { defineStore } from 'pinia'
import { ApiClient } from '../services/apiClient'

export const useHrStore = defineStore('hr', {
  state: () => ({
    fines: [],
    isLoading: false
  }),
  getters: {
    getFinesForUser: (state) => (userId) => state.fines.filter(f => f.user_id === userId),
    getAllFines: (state) => state.fines
  },
  actions: {
    async fetchFines() {
      this.isLoading = true
      const data = await ApiClient.get('hr_fines')
      if (data) this.fines = data
      this.isLoading = false
    },
    async issueFine(userId, amount, reason) {
      const payload = {
        user_id: userId,
        amount,
        reason,
        date: new Date().toLocaleDateString('en-CA'),
        status: 'Unpaid'
      }
      const res = await ApiClient.post('hr_fines', payload)
      if (res && res.success) {
        this.fines.unshift(res.data)
      } else {
        console.error('Failed to issue fine', res?.error)
        throw new Error(res?.error?.message || 'Failed to issue fine')
      }
    },
    async modifyFine(fineId, amount, reason) {
      const fine = this.fines.find(f => f.id === fineId)
      if (fine) {
        const res = await ApiClient.put('hr_fines', fineId, { amount, reason })
        if (res && res.success) {
          fine.amount = amount
          fine.reason = reason
        } else {
          console.error('Failed to modify fine', res?.error)
          throw new Error(res?.error?.message || 'Failed to modify fine')
        }
      }
    },
    async payFine(fineId) {
      const fine = this.fines.find(f => f.id === fineId)
      if (fine) {
        const res = await ApiClient.put('hr_fines', fineId, { status: 'Paid' })
        if (res && res.success) {
          fine.status = 'Paid'
        } else {
          console.error('Failed to mark fine paid', res?.error)
          throw new Error(res?.error?.message || 'Failed to mark fine paid')
        }
      }
    }
  }
})
