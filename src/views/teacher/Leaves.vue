<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../store/auth'
import { useLeavesStore } from '../../store/leaves'
import { useUsersStore } from '../../store/users'

const authStore = useAuthStore()
const leavesStore = useLeavesStore()
const usersStore = useUsersStore()

onMounted(() => {
  leavesStore.fetchLeaves()
})

const teacherId = computed(() => authStore.user?.id)
const activeTab = ref('my-leaves')


const myLeaves = computed(() => leavesStore.records.filter(l => l.requesterId === teacherId.value))
const leaveForm = ref({ date: '', reason: '' })

const submitLeave = async () => {
  if (!leaveForm.value.date || !leaveForm.value.reason) return

  try {
    await leavesStore.requestLeave({
      requesterId: teacherId.value,
      requesterRole: 'teacher',
      type: 'full-day',
      date: leaveForm.value.date,
      reason: leaveForm.value.reason
    })
    leaveForm.value = { date: '', reason: '' }
  } catch (e) {
    alert('Could not submit leave request: ' + e.message)
  }
}


const studentRequests = computed(() => {
  return leavesStore.records
    .filter(l => l.targetTeacherId === teacherId.value && l.status === 'pending')
    .map(l => ({
      ...l,
      student: usersStore.users.find(u => u.id === l.requesterId)
    }))
})

const handleRequest = (id, status) => {
  leavesStore.updateLeaveStatus(id, status)
}
</script>

<template>
  <div class="flex flex-col h-full gap-8">
    <div class="flex items-center justify-end">
      
      <div class="flex bg-slate-100 p-1 rounded-xl">
        <button @click="activeTab = 'my-leaves'" :class="activeTab === 'my-leaves' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'" class="px-4 py-2 rounded-lg font-bold text-sm transition-all">My Leaves</button>
        <button @click="activeTab = 'student-requests'" :class="activeTab === 'student-requests' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'" class="px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2">
          Student Requests
          <span v-if="studentRequests.length > 0" class="bg-danger text-white text-[10px] px-1.5 py-0.5 rounded-full">{{ studentRequests.length }}</span>
        </button>
      </div>
    </div>
    
    
    <div v-if="activeTab === 'my-leaves'" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="glass-panel p-6 rounded-3xl h-fit border border-white/60 bg-gradient-to-br from-white/90 to-white/50 shadow-xl shadow-slate-200/50 relative overflow-hidden">
        <div class="absolute -right-10 -bottom-10 w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-2xl pointer-events-none"></div>
        <h3 class="font-bold text-slate-800 text-lg mb-6 relative z-10">Request a Leave</h3>
        
        <form @submit.prevent="submitLeave" class="flex flex-col gap-5 relative z-10">
          <div>
            <label class="block mb-2 text-sm font-bold text-slate-700">Date</label>
            <input type="date" v-model="leaveForm.date" class="form-input shadow-sm" required />
          </div>
          <div>
            <label class="block mb-2 text-sm font-bold text-slate-700">Reason</label>
            <textarea v-model="leaveForm.reason" rows="4" class="form-input shadow-sm" placeholder="Please provide a valid reason..." required></textarea>
          </div>
          <button type="submit" class="btn-primary shadow-lg shadow-primary/20 mt-2">Submit Request</button>
        </form>
      </div>
      
      <div class="col-span-1 lg:col-span-2 glass-panel rounded-3xl border border-white/60 bg-white/70 backdrop-blur-md shadow-xl overflow-hidden flex flex-col">
        <div class="px-6 py-5 border-b border-slate-200/60 bg-slate-50/50">
          <h3 class="font-bold text-slate-800">My Request History</h3>
        </div>
        <div class="flex-1 overflow-y-auto p-0">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200">
                <th class="py-3 px-6 text-xs uppercase tracking-wider font-bold text-slate-500">Date</th>
                <th class="py-3 px-6 text-xs uppercase tracking-wider font-bold text-slate-500">Reason</th>
                <th class="py-3 px-6 text-xs uppercase tracking-wider font-bold text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="leave in myLeaves" :key="leave.id" class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td class="py-4 px-6 font-medium text-slate-800">{{ leave.date }}</td>
                <td class="py-4 px-6 text-sm text-slate-600">{{ leave.reason }}</td>
                <td class="py-4 px-6">
                  <span class="px-3 py-1 rounded-full text-xs font-bold" :class="{
                    'bg-warning/20 text-warning-dark': leave.status === 'pending',
                    'bg-success/20 text-success-dark': leave.status === 'approved',
                    'bg-danger/20 text-danger': leave.status === 'rejected'
                  }">{{ leave.status.toUpperCase() }}</span>
                </td>
              </tr>
              <tr v-if="myLeaves.length === 0">
                <td colspan="3" class="py-12 text-center text-slate-500 font-medium">You haven't requested any leaves yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    
    <div v-if="activeTab === 'student-requests'" class="flex-1 glass-panel rounded-3xl border border-white/60 bg-white/70 backdrop-blur-md shadow-xl overflow-hidden flex flex-col">
      <div class="px-6 py-5 border-b border-slate-200/60 bg-slate-50/50 flex justify-between items-center">
        <h3 class="font-bold text-slate-800">Pending Student Requests</h3>
      </div>
      <div class="flex-1 overflow-y-auto p-6">
        <div v-if="studentRequests.length === 0" class="h-full flex flex-col items-center justify-center text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-4 opacity-50"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <p class="font-medium text-lg">No pending requests</p>
          <p class="text-sm">You're all caught up!</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-for="req in studentRequests" :key="req.id" class="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col gap-4">
            <div class="flex justify-between items-start">
              <div>
                <h4 class="font-bold text-slate-800">{{ req.student?.name }}</h4>
                <p class="text-xs font-semibold text-primary mt-1">Class Exemption ({{ req.period }})</p>
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
