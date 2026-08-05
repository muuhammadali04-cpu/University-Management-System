import { defineStore } from 'pinia'
import router from '../router'
import { useUsersStore } from './users'
import { ApiClient } from '../services/apiClient'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null, 
    isAuthenticated: false,
    isLoading: false
  }),
  actions: {
    async login(username, password) {
      this.isLoading = true

      const usersStore = useUsersStore()
      // Always pull the latest users from Supabase before checking
      // credentials - otherwise only the hardcoded seed accounts (loaded
      // in memory before any fetch) could ever log in, and any user
      // created from the admin panel would be rejected.
      await usersStore.fetchUsers()

      const matchedUser = usersStore.users.find(
        u => u.id === username && u.password === password
      )
      
      this.isLoading = false
      
      if (matchedUser) {
        if (matchedUser.status !== 'Active') {
          return { success: false, message: 'Your account is deactivated.' }
        }
        
        
        this.user = { ...matchedUser }
        this.isAuthenticated = true
        router.push('/')
        return { success: true }
      }
      
      return { success: false, message: 'Invalid username or password.' }
    },
    async logout() {
      this.isLoading = true

      this.user = null
      this.isAuthenticated = false
      this.isLoading = false
      
      sessionStorage.removeItem('welcomeToastShown')
      router.push('/login')
    }
  }
})
