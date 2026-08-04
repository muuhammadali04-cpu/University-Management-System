import { defineStore } from 'pinia'
import { ApiClient } from '../services/apiClient'

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [
      { id: 'ADM-001', name: 'System Admin', role: 'admin', password: 'password', status: 'Active', joiningDate: '2020-01-15' },
      { id: 'HOD-CS-01', name: 'Dr. Smith', role: 'hod', password: 'password', department: 'Computer Science', status: 'Active', joiningDate: '2015-08-20' },
      { id: 'FAC-001', name: 'Prof. Johnson', role: 'teacher', password: 'password', salary: 85000, status: 'Active', joiningDate: '2018-09-01' },
      { id: 'STD-F23-01', name: 'Jane Doe', role: 'student', password: 'password', feeStatus: 'Paid', balance: 0, status: 'Active', sectionId: 1, batch: 'Fall 2023', joiningDate: '2023-08-15' },
      { id: 'STD-F23-02', name: 'John Smith', role: 'student', password: 'password', feeStatus: 'Pending', balance: 500, status: 'Active', sectionId: 1, batch: 'Fall 2023', joiningDate: '2023-08-16' },
      { id: 'STD-S24-01', name: 'Alice Wonderland', role: 'student', password: 'password', feeStatus: 'Paid', balance: 0, status: 'Active', sectionId: 1, batch: 'Spring 2024', joiningDate: '2024-01-10' },
      { id: 'FIN-001', name: 'Finance Head', role: 'finance', password: 'password', status: 'Active', joiningDate: '2019-03-01' },
      { id: 'HR-001', name: 'HR Manager', role: 'hr', password: 'password', status: 'Active', joiningDate: '2017-11-20' },
      { id: 'LIB-001', name: 'Chief Librarian', role: 'librarian', password: 'password', status: 'Active', joiningDate: '2021-05-15' }
    ],
    isLoading: false
  }),
  getters: {
    getUsersByRole: (state) => (role) => state.users.filter(u => u.role === role)
  },
  actions: {
    async fetchUsers() {
      this.isLoading = true
      const data = await ApiClient.get('users')
      if (data) this.users = data
      this.isLoading = false
    },
    async addUser(userData) {
      this.isLoading = true
      const newUser = { ...userData, status: 'Active' }
      
      const dbPayload = {
        id: userData.id,
        name: userData.name,
        role: userData.role,
        salary: userData.salary || null,
        email: userData.email || null,
        department_id: userData.department_id || null,
        section_id: userData.section_id || null
      }
      
      const res = await ApiClient.post('users', dbPayload)
      if (res && res.success) {
        this.users.push(newUser)
      } else {
        console.error("Failed to add user to Supabase", res?.error)
      }
      this.isLoading = false
    },
    async updateUser(id, updatedData) {
      this.isLoading = true
      const dbPayload = {
        name: updatedData.name,
        role: updatedData.role,
        salary: updatedData.salary || null,
        email: updatedData.email || null,
        department_id: updatedData.department_id || null,
        section_id: updatedData.section_id || null
      }
      
      // Remove undefined/nulls to avoid overwriting with null unintentionally if not provided
      Object.keys(dbPayload).forEach(key => {
        if (dbPayload[key] === undefined) {
          delete dbPayload[key]
        }
      })

      await ApiClient.put('users', id, dbPayload)
      const index = this.users.findIndex(u => u.id === id)
      if (index !== -1) {
        this.users[index] = { ...this.users[index], ...updatedData }
      }
      this.isLoading = false
    },
    async deleteUser(id) {
      this.isLoading = true
      await ApiClient.delete('users', id)
      this.users = this.users.filter(u => u.id !== id)
      this.isLoading = false
    }
  }
})
