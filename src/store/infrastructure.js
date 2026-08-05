import { defineStore } from 'pinia'
import { ApiClient } from '../services/apiClient'

export const useInfrastructureStore = defineStore('infrastructure', {
  state: () => ({
    rooms: [],
    sections: [],
    subjects: [],
    isLoading: false
  }),
  actions: {
    async fetchInfrastructure() {
      this.isLoading = true
      const rooms = await ApiClient.get('infrastructure_rooms')
      const sections = await ApiClient.get('infrastructure_sections')
      const subjects = await ApiClient.get('infrastructure_subjects')
      
      if (rooms) this.rooms = rooms
      if (sections) this.sections = sections
      if (subjects) this.subjects = subjects
      
      this.isLoading = false
    },
    async addRoom(room) {
      // infrastructure_rooms.type is added via the migration SQL (see
      // supabase_migration_fixes.sql). name/capacity are required.
      const payload = { name: room.name, capacity: room.capacity, type: room.type || null }
      const res = await ApiClient.post('infrastructure_rooms', payload)
      if (res && res.success) this.rooms.push(res.data || room)
      else { console.error('Failed to add room', res?.error); throw new Error(res?.error?.message || 'Failed to add room') }
    },
    async updateRoom(id, data) {
      const payload = { name: data.name, capacity: data.capacity, type: data.type || null }
      const res = await ApiClient.put('infrastructure_rooms', id, payload)
      if (res && res.success) {
        const index = this.rooms.findIndex(r => r.id === id)
        if(index !== -1) this.rooms[index] = { ...this.rooms[index], ...data }
      } else { console.error('Failed to update room', res?.error); throw new Error(res?.error?.message || 'Failed to update room') }
    },
    async deleteRoom(id) {
      const res = await ApiClient.delete('infrastructure_rooms', id)
      if (res && res.success) this.rooms = this.rooms.filter(r => r.id !== id)
      else { console.error('Failed to delete room', res?.error); throw new Error(res?.error?.message || 'Failed to delete room') }
    },

    async addSection(section) {
      const payload = { name: section.name, semester: section.semester, program: section.program }
      const res = await ApiClient.post('infrastructure_sections', payload)
      if (res && res.success) this.sections.push(res.data || section)
      else { console.error('Failed to add section', res?.error); throw new Error(res?.error?.message || 'Failed to add section') }
    },
    async updateSection(id, data) {
      const payload = { name: data.name, semester: data.semester, program: data.program }
      const res = await ApiClient.put('infrastructure_sections', id, payload)
      if (res && res.success) {
        const index = this.sections.findIndex(s => s.id === id)
        if(index !== -1) this.sections[index] = { ...this.sections[index], ...data }
      } else { console.error('Failed to update section', res?.error); throw new Error(res?.error?.message || 'Failed to update section') }
    },
    async deleteSection(id) {
      const res = await ApiClient.delete('infrastructure_sections', id)
      if (res && res.success) this.sections = this.sections.filter(s => s.id !== id)
      else { console.error('Failed to delete section', res?.error); throw new Error(res?.error?.message || 'Failed to delete section') }
    },

    async addSubject(subject) {
      const payload = { name: subject.name, code: subject.code, credits: subject.credits }
      const res = await ApiClient.post('infrastructure_subjects', payload)
      if (res && res.success) this.subjects.push(res.data || subject)
      else { console.error('Failed to add subject', res?.error); throw new Error(res?.error?.message || 'Failed to add subject') }
    },
    async updateSubject(id, data) {
      const payload = { name: data.name, code: data.code, credits: data.credits }
      const res = await ApiClient.put('infrastructure_subjects', id, payload)
      if (res && res.success) {
        const index = this.subjects.findIndex(s => s.id === id)
        if(index !== -1) this.subjects[index] = { ...this.subjects[index], ...data }
      } else { console.error('Failed to update subject', res?.error); throw new Error(res?.error?.message || 'Failed to update subject') }
    },
    async deleteSubject(id) {
      const res = await ApiClient.delete('infrastructure_subjects', id)
      if (res && res.success) this.subjects = this.subjects.filter(s => s.id !== id)
      else { console.error('Failed to delete subject', res?.error); throw new Error(res?.error?.message || 'Failed to delete subject') }
    }
  }
})
