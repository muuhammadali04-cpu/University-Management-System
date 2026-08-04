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
      const res = await ApiClient.post('infrastructure_rooms', room)
      if (res && res.success) this.rooms.push(res.data || room)
    },
    async updateRoom(id, data) {
      const res = await ApiClient.put('infrastructure_rooms', id, data)
      if (res && res.success) {
        const index = this.rooms.findIndex(r => r.id === id)
        if(index !== -1) this.rooms[index] = { ...this.rooms[index], ...data }
      }
    },
    async deleteRoom(id) {
      const res = await ApiClient.delete('infrastructure_rooms', id)
      if (res && res.success) this.rooms = this.rooms.filter(r => r.id !== id)
    },
    
    async addSection(section) {
      const res = await ApiClient.post('infrastructure_sections', section)
      if (res && res.success) this.sections.push(res.data || section)
    },
    async updateSection(id, data) {
      const res = await ApiClient.put('infrastructure_sections', id, data)
      if (res && res.success) {
        const index = this.sections.findIndex(s => s.id === id)
        if(index !== -1) this.sections[index] = { ...this.sections[index], ...data }
      }
    },
    async deleteSection(id) {
      const res = await ApiClient.delete('infrastructure_sections', id)
      if (res && res.success) this.sections = this.sections.filter(s => s.id !== id)
    },
    
    async addSubject(subject) {
      const res = await ApiClient.post('infrastructure_subjects', subject)
      if (res && res.success) this.subjects.push(res.data || subject)
    },
    async updateSubject(id, data) {
      const res = await ApiClient.put('infrastructure_subjects', id, data)
      if (res && res.success) {
        const index = this.subjects.findIndex(s => s.id === id)
        if(index !== -1) this.subjects[index] = { ...this.subjects[index], ...data }
      }
    },
    async deleteSubject(id) {
      const res = await ApiClient.delete('infrastructure_subjects', id)
      if (res && res.success) this.subjects = this.subjects.filter(s => s.id !== id)
    }
  }
})
