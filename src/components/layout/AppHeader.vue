<script setup>
import { useAuthStore } from '../../store/auth'
import { useNotificationStore } from '../../store/notifications'
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const user = computed(() => authStore.user)
const unreadCount = computed(() => notificationStore.unreadCount)
const notifications = computed(() => notificationStore.myAlerts)

const showNotifications = ref(false)
const notifContainer = ref(null)

const routeTitle = computed(() => {
  const map = {
    'Dashboard': 'Overview Dashboard',
    'AdminUsers': 'User Directory',
    'AdminInfrastructure': 'Infrastructure Management',
    'AdminAppointments': 'Role Appointments',
    'HodDirectory': 'Department Directory',
    'HodAppointments': 'Department Appointments',
    'HodPendingApprovals': 'Pending Timetable Requests',
    'HodTimetable': 'Master Timetable Matrix',
    'TeacherTimetable': 'My Timetable Builder'
  }
  return map[route.name] || String(route.name || '').replace(/([A-Z])/g, ' $1').trim()
})


const handleClickOutside = (event) => {
  if (showNotifications.value && notifContainer.value && !notifContainer.value.contains(event.target)) {
    showNotifications.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleLogout = () => {
  authStore.logout()
}

defineEmits(['toggle-sidebar'])
</script>

<template>
  <header class="flex items-center justify-between px-4 md:px-8 h-20 bg-white/70 backdrop-blur-md border-b border-slate-200/60 shrink-0 sticky top-0 z-40 shadow-sm transition-all duration-300 print:hidden">
    <div class="flex items-center gap-4">
      <button @click="$emit('toggle-sidebar')" class="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
      <h2 class="text-lg md:text-xl font-bold text-slate-800 tracking-tight">{{ routeTitle }}</h2>
    </div>
    
    <div class="flex items-center gap-6 relative">
      
      
      <div class="relative" ref="notifContainer">
        <button @click="showNotifications = !showNotifications" class="relative p-2.5 text-slate-500 hover:text-accent hover:bg-slate-100 rounded-full transition-all duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
          </svg>
          <span v-if="unreadCount > 0" class="absolute top-1.5 right-1.5 w-3 h-3 bg-rose-500 rounded-full border-2 border-white shadow-sm animate-pulse"></span>
        </button>

        
        <div v-if="showNotifications" class="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden transform origin-top-right transition-all z-50">
          <div class="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 class="font-semibold text-slate-800">Notifications</h3>
            <span class="text-xs font-bold text-accent bg-accent/10 px-2 py-1 rounded-full">{{ unreadCount }} new</span>
          </div>
          <div class="max-h-80 overflow-y-auto">
            <div v-if="notifications.length === 0" class="p-6 text-center text-slate-500 text-sm">
              No new notifications.
            </div>
            <div v-for="notif in notifications" :key="notif.id" class="px-5 py-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 items-start">
              <div class="w-2 h-2 rounded-full mt-1.5 shrink-0" :class="{
                'bg-warning': notif.type === 'warning',
                'bg-secondary': notif.type === 'success',
                'bg-primary': notif.type === 'info',
                'bg-danger': notif.type === 'error'
              }"></div>
              <div>
                <p class="text-sm text-slate-700 font-medium leading-snug">{{ notif.message }}</p>
                <span class="text-xs text-slate-400 mt-1 block">{{ notif.time }}</span>
              </div>
            </div>
          </div>
          <div v-if="notifications.length > 0" class="p-3 text-center border-t border-slate-100 bg-slate-50/50">
            <button @click="notificationStore.clearNotifications" class="text-xs font-semibold text-slate-500 hover:text-primary transition-colors">Clear all</button>
          </div>
        </div>
      </div>

      <div class="h-8 w-px bg-slate-200"></div>

      
      <div class="flex items-center gap-3 group">
        <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
          <span class="text-white font-bold text-sm">{{ user?.name?.charAt(0).toUpperCase() || 'U' }}</span>
        </div>
        <div class="flex flex-col text-left mr-2 hidden sm:flex">
          <span class="font-bold text-sm text-slate-800 leading-tight">{{ user?.name }}</span>
          <span class="text-xs text-slate-500 capitalize font-medium">{{ user?.role }}</span>
        </div>
        <button @click="handleLogout" title="Logout" class="p-2 text-slate-400 hover:text-danger hover:bg-red-50 rounded-full transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>
