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
    isLoading: false,
    error: null
  }),
  getters: {
    getUsersByRole: (state) => (role) => state.users.filter(u => u.role === role)
  },
  actions: {
    async fetchUsers() {
      this.isLoading = true
      this.error = null
      const data = await ApiClient.get('users')
      if (data) this.users = data
      this.isLoading = false
    },
    // Builds a payload that only contains columns that actually exist on the
    // `users` table (see supabase_schema.sql). Sending unknown columns
    // (e.g. email / department_id) makes PostgREST reject the whole request.
    _toDbPayload(userData, { isUpdate = false } = {}) {
      const payload = {
        name: userData.name,
        role: userData.role,
        status: userData.status || 'Active',
        salary: userData.salary || null,
        department: userData.department || null,
        section_id: userData.section_id || userData.sectionId || null,
        fee_status: userData.fee_status || userData.feeStatus || null,
        balance: userData.balance ?? null,
        batch: userData.batch || null,
        joining_date: userData.joining_date || userData.joiningDate || new Date().toISOString().slice(0, 10)
      }

      // password column is NOT NULL in the DB - only send it if we have one,
      // and always send it on create.
      if (userData.password) {
        payload.password = userData.password
      } else if (!isUpdate) {
        payload.password = 'password' // fallback default so the insert never fails
      }

      if (!isUpdate) {
        payload.id = userData.id
      }

      return payload
    },
    async addUser(userData) {
      this.isLoading = true
      this.error = null

      const dbPayload = this._toDbPayload(userData, { isUpdate: false })

      const res = await ApiClient.post('users', dbPayload)
      if (res && res.success) {
        // Use what the DB actually stored so the table reflects reality
        this.users.push(res.data || { ...userData, status: 'Active' })
      } else {
        console.error("Failed to add user to Supabase", res?.error)
        this.error = res?.error?.message || 'Failed to add user'
        this.isLoading = false
        throw new Error(this.error)
      }
      this.isLoading = false
    },
    async updateUser(id, updatedData) {
      this.isLoading = true
      this.error = null

      const dbPayload = this._toDbPayload(updatedData, { isUpdate: true })

      // Remove undefined values to avoid overwriting with null unintentionally if not provided
      Object.keys(dbPayload).forEach(key => {
        if (dbPayload[key] === undefined) {
          delete dbPayload[key]
        }
      })

      const res = await ApiClient.put('users', id, dbPayload)
      if (res && res.success) {
        const index = this.users.findIndex(u => u.id === id)
        if (index !== -1) {
          this.users[index] = { ...this.users[index], ...(res.data || updatedData) }
        }
      } else {
        console.error("Failed to update user in Supabase", res?.error)
        this.error = res?.error?.message || 'Failed to update user'
        this.isLoading = false
        throw new Error(this.error)
      }
      this.isLoading = false
    },
    async deleteUser(id) {
      this.isLoading = true
      this.error = null
      const res = await ApiClient.delete('users', id)
      if (res && res.success) {
        this.users = this.users.filter(u => u.id !== id)
      } else {
        console.error("Failed to delete user in Supabase", res?.error)
        this.error = res?.error?.message || 'Failed to delete user'
        this.isLoading = false
        throw new Error(this.error)
      }
      this.isLoading = false
    }
  }
})
