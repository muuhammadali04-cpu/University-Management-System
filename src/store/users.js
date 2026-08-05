import { defineStore } from 'pinia'
import { ApiClient } from '../services/apiClient'

// Supabase returns snake_case (section_id, fee_status, joining_date) but
// several views read camelCase (sectionId, feeStatus, joiningDate).
// Normalizing here keeps both conventions working everywhere.
function normalizeUser(u) {
  if (!u) return u
  return {
    ...u,
    sectionId: u.section_id ?? u.sectionId,
    section_id: u.section_id ?? u.sectionId,
    feeStatus: u.fee_status ?? u.feeStatus,
    fee_status: u.fee_status ?? u.feeStatus,
    joiningDate: u.joining_date ?? u.joiningDate,
    joining_date: u.joining_date ?? u.joiningDate
  }
}

export const useUsersStore = defineStore('users', {
  state: () => ({
    // Previously pre-loaded with hardcoded demo accounts. Now starts
    // empty and is always populated from Supabase via fetchUsers() -
    // login calls this before matching credentials, and every page that
    // needs the user list calls it on mount.
    users: [],
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
      if (data) this.users = data.map(normalizeUser)
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
        this.users.push(normalizeUser(res.data) || { ...userData, status: 'Active' })
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
          this.users[index] = normalizeUser({ ...this.users[index], ...(res.data || updatedData) })
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
