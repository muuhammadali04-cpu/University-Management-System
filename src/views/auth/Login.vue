<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '../../store/auth'

const authStore = useAuthStore()
const username = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMessage = ref('')

watch(username, (val) => {
  if (val !== val.toUpperCase()) {
    username.value = val.toUpperCase()
  }
})

const handleLogin = async () => {
  errorMessage.value = ''
  if (username.value && password.value) {
    const result = await authStore.login(username.value, password.value)
    if (!result.success) {
      errorMessage.value = result.message
    }
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200/50 relative overflow-hidden">
    
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-3xl"></div>
    </div>
    
    <div class="w-full max-w-md p-10 rounded-3xl glass-panel relative z-10 border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      <div class="text-center mb-10">
        <div class="w-16 h-16 bg-gradient-to-tr from-primary to-accent rounded-2xl mx-auto shadow-lg shadow-primary/30 mb-6 flex items-center justify-center transform rotate-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
        </div>
        <h1 class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent tracking-tight">Nexus Uni</h1>
        <p class="text-slate-500 mt-2 font-medium">Enter your credentials to access the portal</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="flex flex-col gap-5">
        
        <div v-if="errorMessage" class="p-4 bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl font-semibold flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {{ errorMessage }}
        </div>
        
        <div>
          <label class="block mb-2 text-sm font-bold text-slate-700">User ID</label>
          <input type="text" v-model="username" class="form-input shadow-sm" placeholder="e.g. ADM-001" required />
        </div>
        
        <div>
          <label class="block mb-2 text-sm font-bold text-slate-700">Password</label>
          <div class="relative">
            <input :type="showPassword ? 'text' : 'password'" v-model="password" class="form-input shadow-sm pr-12" placeholder="e.g. password" required />
            <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors p-1" title="Toggle Password Visibility">
              <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
            </button>
          </div>
        </div>
        
        <button type="submit" :disabled="authStore.isLoading" class="btn-primary mt-4 py-3.5 text-lg shadow-primary/20 shadow-lg group flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
          <span v-if="authStore.isLoading">Authenticating...</span>
          <span v-else class="flex items-center gap-2">
            Sign In
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </span>
        </button>
      </form>

      <div class="mt-8 pt-6 border-t border-slate-200/60">
        <p class="text-xs text-center text-slate-400 leading-relaxed">
          Available demo accounts:<br/> 
          <span class="font-semibold text-slate-500">ADM-001, HOD-CS-01, FAC-001, STD-F23-01, FIN-001, HR-001, LIB-001</span><br/>
          (Password: <span class="font-mono bg-slate-100 px-1 py-0.5 rounded font-bold text-slate-600">password</span>)
        </p>
      </div>
    </div>
  </div>
</template>
