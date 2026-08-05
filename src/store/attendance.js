import { defineStore } from 'pinia'
import { ApiClient } from '../services/apiClient'

function normalizeAttendance(r) {
  if (!r) return r
  return {
    ...r,
    studentId: r.student_id ?? r.studentId,
    subjectId: r.subject_id ?? r.subjectId,
    student_id: r.student_id ?? r.studentId,
    subject_id: r.subject_id ?? r.subjectId
  }
}

export const useAttendanceStore = defineStore('attendance', {
  state: () => ({
    records: [],
    isLoading: false
  }),
  actions: {
    async fetchAttendance() {
      this.isLoading = true
      const data = await ApiClient.get('academic_attendance')
      if (data) this.records = data.map(normalizeAttendance)
      this.isLoading = false
    },
    async markAttendance(subjectId, date, studentId, status) {
      const existing = this.records.find(r => r.subject_id === subjectId && r.date === date && r.student_id === studentId)
      
      if (existing) {
        const res = await ApiClient.put('academic_attendance', existing.id, { status })
        if (res && res.success) existing.status = status
        else { console.error('Failed to update attendance', res?.error); throw new Error(res?.error?.message || 'Failed to update attendance') }
      } else {
        const payload = {
          subject_id: subjectId,
          date,
          student_id: studentId,
          status
        }
        const res = await ApiClient.post('academic_attendance', payload)
        if (res && res.success) this.records.push(normalizeAttendance(res.data))
        else { console.error('Failed to save attendance', res?.error); throw new Error(res?.error?.message || 'Failed to save attendance') }
      }
    },
    getAttendanceForStudent(studentId) {
      return this.records.filter(r => r.student_id === studentId)
    }
  }
})
