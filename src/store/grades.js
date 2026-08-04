import { defineStore } from 'pinia'
import { ApiClient } from '../services/apiClient'

export const useGradesStore = defineStore('grades', {
  state: () => ({
    records: [],
    isLoading: false
  }),
  actions: {
    async fetchGrades() {
      this.isLoading = true
      const data = await ApiClient.get('academic_grades')
      if (data) this.records = data
      this.isLoading = false
    },
    async saveGrade(studentId, subjectId, teacherId, grades) {
      const existing = this.records.find(r => r.student_id === studentId && r.subject_id === subjectId)
      
      const payload = {
        student_id: studentId,
        subject_id: subjectId,
        midterm: grades.midterm || 0,
        final: grades.final || 0,
        assignments: grades.assignments || 0
      }

      if (existing) {
        const res = await ApiClient.put('academic_grades', existing.id, payload)
        if (res && res.success) {
          Object.assign(existing, payload)
        }
      } else {
        const res = await ApiClient.post('academic_grades', payload)
        if (res && res.success) {
          this.records.push(res.data)
        }
      }
    },
    getGradesForStudent(studentId) {
      return this.records.filter(r => r.student_id === studentId)
    }
  }
})
