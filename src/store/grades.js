import { defineStore } from 'pinia'
import { ApiClient } from '../services/apiClient'

function normalizeGrade(r) {
  if (!r) return r
  return {
    ...r,
    studentId: r.student_id ?? r.studentId,
    subjectId: r.subject_id ?? r.subjectId,
    teacherId: r.teacher_id ?? r.teacherId,
    student_id: r.student_id ?? r.studentId,
    subject_id: r.subject_id ?? r.subjectId,
    teacher_id: r.teacher_id ?? r.teacherId
  }
}

export const useGradesStore = defineStore('grades', {
  state: () => ({
    records: [],
    isLoading: false
  }),
  actions: {
    async fetchGrades() {
      this.isLoading = true
      const data = await ApiClient.get('academic_grades')
      if (data) this.records = data.map(normalizeGrade)
      this.isLoading = false
    },
    async saveGrade(studentId, subjectId, teacherId, grades) {
      const existing = this.records.find(r => r.student_id === studentId && r.subject_id === subjectId)
      
      const payload = {
        student_id: studentId,
        subject_id: subjectId,
        teacher_id: teacherId,
        midterm: grades.midterm || 0,
        final: grades.final || 0,
        assignments: grades.assignments || 0
      }

      if (existing) {
        const res = await ApiClient.put('academic_grades', existing.id, payload)
        if (res && res.success) {
          Object.assign(existing, normalizeGrade(payload))
        } else {
          console.error('Failed to update grade', res?.error)
          throw new Error(res?.error?.message || 'Failed to update grade')
        }
      } else {
        const res = await ApiClient.post('academic_grades', payload)
        if (res && res.success) {
          this.records.push(normalizeGrade(res.data))
        } else {
          console.error('Failed to save grade', res?.error)
          throw new Error(res?.error?.message || 'Failed to save grade')
        }
      }
    },
    getGradesForStudent(studentId) {
      return this.records.filter(r => r.student_id === studentId)
    }
  }
})
