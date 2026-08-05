import { defineStore } from 'pinia'
import { ApiClient } from '../services/apiClient'

// Supabase returns snake_case columns (teacher_id, subject_id, ...) but a lot
// of the UI was written expecting camelCase (teacherId, subjectId, ...).
// Normalizing here means every consumer works regardless of which
// convention it uses.
function normalizeAppointment(a) {
  if (!a) return a
  return {
    ...a,
    teacherId: a.teacher_id ?? a.teacherId,
    subjectId: a.subject_id ?? a.subjectId,
    sectionId: a.section_id ?? a.sectionId,
    roomId: a.room_id ?? a.roomId,
    teacher_id: a.teacher_id ?? a.teacherId,
    subject_id: a.subject_id ?? a.subjectId,
    section_id: a.section_id ?? a.sectionId,
    room_id: a.room_id ?? a.roomId
  }
}

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
        this.appointments = data.map(normalizeAppointment)
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
        const created = normalizeAppointment(res.data)
        this.appointments.push(created)
        return created
      } else {
        console.error('Failed to add appointment', res?.error)
        throw new Error(res?.error?.message || 'Failed to add appointment')
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
