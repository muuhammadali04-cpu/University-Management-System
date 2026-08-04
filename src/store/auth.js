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
      
      
      await ApiClient.get('auth')
      
      const usersStore = useUsersStore()
      
      
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
      
      
      await ApiClient.post('auth/logout')
      
      this.user = null
      this.isAuthenticated = false
      this.isLoading = false
      
      sessionStorage.removeItem('welcomeToastShown')
      router.push('/login')
    }
  }
})
