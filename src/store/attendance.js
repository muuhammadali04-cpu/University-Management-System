import { defineStore } from 'pinia'
import { ApiClient } from '../services/apiClient'

export const useAttendanceStore = defineStore('attendance', {
  state: () => ({
    records: [],
    isLoading: false
  }),
  actions: {
    async fetchAttendance() {
      this.isLoading = true
      const data = await ApiClient.get('academic_attendance')
      if (data) this.records = data
      this.isLoading = false
    },
    async markAttendance(subjectId, date, studentId, status) {
      const existing = this.records.find(r => r.subject_id === subjectId && r.date === date && r.student_id === studentId)
      
      if (existing) {
        const res = await ApiClient.put('academic_attendance', existing.id, { status })
        if (res && res.success) existing.status = status
      } else {
        const payload = {
          subject_id: subjectId,
          date,
          student_id: studentId,
          status
        }
        const res = await ApiClient.post('academic_attendance', payload)
        if (res && res.success) this.records.push(res.data)
      }
    },
    getAttendanceForStudent(studentId) {
      return this.records.filter(r => r.student_id === studentId)
    }
  }
})
