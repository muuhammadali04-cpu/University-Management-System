import { defineStore } from 'pinia'
import { ApiClient } from '../services/apiClient'

export const useAppointmentsStore = defineStore('appointments', {
  state: () => ({
    appointments: [],
    isLoading: false
  }),
  actions: {
    async fetchAppointments() {
      this.isLoading = true
      const data = await ApiClient.get('appointments')
      if (data) {
        this.appointments = data
      }
      this.isLoading = false
    },
    async addAppointment(appointment) {
      const payload = {
        teacher_id: appointment.teacherId,
        subject_id: appointment.subjectId,
        section_id: appointment.sectionId,
        room_id: appointment.roomId
      }
      const res = await ApiClient.post('appointments', payload)
      if (res && res.success) {
        this.appointments.push(res.data)
      }
    },
    async deleteAppointment(id) {
      const res = await ApiClient.delete('appointments', id)
      if (res && res.success) {
        this.appointments = this.appointments.filter(a => a.id !== id)
      }
    }
  }
})
