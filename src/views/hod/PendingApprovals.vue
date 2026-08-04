<script setup>
import { computed, ref } from 'vue'
import { useTimetablesStore } from '../../store/timetables'
import { useAppointmentsStore } from '../../store/appointments'
import { useUsersStore } from '../../store/users'
import { useInfrastructureStore } from '../../store/infrastructure'
import { onMounted } from 'vue'

const ttStore = useTimetablesStore()
const apptStore = useAppointmentsStore()
const userStore = useUsersStore()
const infraStore = useInfrastructureStore()

onMounted(() => {
  apptStore.fetchAppointments()
  ttStore.fetchTimetables()
})

const getTeacherName = (id) => userStore.users.find(u => u.id === id)?.name || 'Unknown'
const getSubjectName = (id) => infraStore.subjects.find(s => s.id === id)?.name || 'Unknown'
const getRoomName = (id) => infraStore.rooms.find(r => r.id === id)?.name || 'Unknown'
const getSectionName = (id) => infraStore.sections.find(s => s.id === id)?.name || 'Unknown'

const pendingRequests = computed(() => ttStore.slots.filter(s => s.status === 'pending'))

const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success') 

const displayToast = (msg, type = 'success') => {
  toastMessage.value = msg
  toastType.value = type
  showToast.value = true
  setTimeout(() => showToast.value = false, 3000)
}

const handleApprove = (slotId) => {
  const result = ttStore.approveSlot(slotId)
  if (!result.success) {
    displayToast("Conflict Prevented: " + result.message, 'error')
  } else {
    displayToast("Timetable request approved successfully.")
  }
}

const handleReject = (slotId) => {
  if (confirm("Reject this slot request?")) {
    ttStore.rejectSlot(slotId)
    displayToast("Timetable request rejected.")
  }
}
</script>

<template>
  <div class="flex flex-col h-full pb-8 relative">
    
    
    <transition enter-active-class="transition duration-300 ease-out" enter-from-class="transform translate-y-2 opacity-0" enter-to-class="transform translate-y-0 opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="transform translate-y-0 opacity-100" leave-to-class="transform translate-y-2 opacity-0">
      <div v-if="showToast" class="fixed bottom-10 right-10 z-[100] bg-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700">
        <div class="w-8 h-8 rounded-full flex items-center justify-center" :class="toastType === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'">
          <svg v-if="toastType === 'success'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <span class="font-medium">{{ toastMessage }}</span>
      </div>
    </transition>

    <div class="glass-panel p-6 rounded-2xl flex flex-col flex-1">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h3 class="font-bold text-slate-800 text-xl flex items-center gap-3">
            Pending Timetable Requests
            <span v-if="pendingRequests.length > 0" class="flex h-3 w-3 relative">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          </h3>
          <p class="text-sm text-slate-500 mt-1">Review and approve scheduling requests submitted by teachers.</p>
        </div>
        <span class="text-xs font-bold text-slate-500 bg-slate-100 px-4 py-2 rounded-full">{{ pendingRequests.length }} requests</span>
      </div>
      
      <div class="overflow-y-auto pr-2 space-y-4 flex-1">
        <div v-if="pendingRequests.length === 0" class="flex flex-col items-center justify-center h-full text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-4 opacity-50"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <p class="font-medium text-lg">You're all caught up!</p>
          <p class="text-sm mt-1">No pending timetable requests to approve.</p>
        </div>
        
        <div v-for="req in pendingRequests" :key="req.id" class="p-5 border border-amber-100 bg-amber-50/40 rounded-2xl flex items-center justify-between group transition-all hover:bg-amber-50/80 shadow-sm hover:shadow-md">
          <div class="flex flex-col gap-1.5">
            <div class="flex items-center gap-2 text-lg">
              <span class="font-bold text-slate-800">{{ getTeacherName(apptStore.appointments.find(a => a.id === req.appointmentId)?.teacher_id) }}</span>
              <span class="text-sm text-slate-500 font-medium mx-1">requests to schedule</span>
              <span class="font-bold text-primary">{{ getSubjectName(apptStore.appointments.find(a => a.id === req.appointmentId)?.subject_id) }}</span>
            </div>
            <div class="text-sm font-semibold text-slate-600 flex items-center gap-3">
              <span class="flex items-center gap-1.5 bg-white px-3 py-1 rounded-lg border border-amber-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-amber-500"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                {{ req.day }} &bull; {{ req.period }}
              </span>
              
              <span class="flex items-center gap-1.5 bg-white px-3 py-1 rounded-lg border border-amber-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-amber-500"><path d="M3 21h18"></path><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"></path></svg>
                {{ getRoomName(apptStore.appointments.find(a => a.id === req.appointmentId)?.room_id) }}
              </span>
              
              <span class="flex items-center gap-1.5 bg-white px-3 py-1 rounded-lg border border-amber-100">
                Section: {{ getSectionName(apptStore.appointments.find(a => a.id === req.appointmentId)?.section_id) }}
              </span>
            </div>
          </div>
          
          <div class="flex gap-3">
            <button @click="handleApprove(req.id)" class="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 rounded-xl font-bold text-sm transition-all">Approve Request</button>
            <button @click="handleReject(req.id)" class="px-5 py-2.5 bg-white border border-slate-200 text-rose-500 hover:bg-rose-50 hover:border-rose-200 rounded-xl font-bold text-sm transition-all shadow-sm">Reject</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
