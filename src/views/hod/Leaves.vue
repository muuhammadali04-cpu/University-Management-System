<script setup>
import { computed, ref, onMounted } from 'vue'
import { useLeavesStore } from '../../store/leaves'
import { useUsersStore } from '../../store/users'

const leavesStore = useLeavesStore()
const usersStore = useUsersStore()

onMounted(() => {
  leavesStore.fetchLeaves()
})

const hodRequests = computed(() => {
  return leavesStore.records
    .filter(l => (l.type === 'full-day' || l.requesterRole === 'teacher') && l.status === 'pending')
    .map(l => ({
      ...l,
      requester: usersStore.users.find(u => u.id === l.requesterId)
    }))
})

const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

const displayToast = (msg, type = 'success') => {
  toastMessage.value = msg
  toastType.value = type
  showToast.value = true
  setTimeout(() => showToast.value = false, 3000)
}

const handleRequest = async (id, status) => {
  try {
    await leavesStore.updateLeaveStatus(id, status)
    displayToast(`Leave request ${status}.`, status === 'approved' ? 'success' : 'error')
  } catch (e) {
    displayToast('Could not update request: ' + e.message, 'error')
  }
}
</script>

<template>
  <div class="flex flex-col h-full gap-8 relative">
    
    
    <transition enter-active-class="transition duration-300 ease-out" enter-from-class="transform translate-y-2 opacity-0" enter-to-class="transform translate-y-0 opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="transform translate-y-0 opacity-100" leave-to-class="transform translate-y-2 opacity-0">
      <div v-if="showToast" class="fixed bottom-10 right-10 z-[100] bg-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700">
        <div class="w-8 h-8 rounded-full flex items-center justify-center" :class="toastType === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'">
          <svg v-if="toastType === 'success'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <span class="font-medium">{{ toastMessage }}</span>
      </div>
    </transition>
    
    
    <div class="flex-1 glass-panel rounded-3xl border border-white/60 bg-white/70 backdrop-blur-md shadow-xl overflow-hidden flex flex-col">
      <div class="px-6 py-5 border-b border-slate-200/60 bg-slate-50/50 flex justify-between items-center">
        <h3 class="font-bold text-slate-800">Pending Requests</h3>
      </div>
      <div class="flex-1 overflow-y-auto p-6">
        <div v-if="hodRequests.length === 0" class="h-full flex flex-col items-center justify-center text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-4 opacity-50"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <p class="font-medium text-lg">No pending requests</p>
          <p class="text-sm">You're all caught up!</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="req in hodRequests" :key="req.id" class="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col gap-4">
            <div class="flex justify-between items-start">
              <div>
                <h4 class="font-bold text-slate-800">{{ req.requester?.name }}</h4>
                <p class="text-xs font-semibold text-primary mt-1 uppercase tracking-widest">{{ req.requesterRole }}</p>
              </div>
              <span class="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-1 rounded-md">{{ req.date }}</span>
            </div>
            
            <div class="bg-slate-50 p-4 rounded-xl text-sm text-slate-600 border border-slate-100">
              <span class="font-bold text-slate-700 block mb-1">Reason:</span>
              {{ req.reason }}
            </div>
            
            <div class="flex gap-3 mt-auto pt-2">
              <button @click="handleRequest(req.id, 'approved')" class="flex-1 bg-success/10 hover:bg-success text-success-dark hover:text-white py-2 rounded-lg font-bold text-sm transition-colors border border-success/20 hover:border-success">Approve</button>
              <button @click="handleRequest(req.id, 'rejected')" class="flex-1 bg-danger/10 hover:bg-danger text-danger hover:text-white py-2 rounded-lg font-bold text-sm transition-colors border border-danger/20 hover:border-danger">Reject</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
