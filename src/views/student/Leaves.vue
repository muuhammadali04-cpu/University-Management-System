<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useAuthStore } from '../../store/auth'
import { useLeavesStore } from '../../store/leaves'
import { useTimetablesStore } from '../../store/timetables'
import { useAppointmentsStore } from '../../store/appointments'

const authStore = useAuthStore()
const leavesStore = useLeavesStore()
const timetablesStore = useTimetablesStore()
const appointmentsStore = useAppointmentsStore()

onMounted(() => {
  leavesStore.fetchLeaves()
  timetablesStore.fetchTimetables()
  appointmentsStore.fetchAppointments()
})

const studentId = computed(() => authStore.user?.id)
const sectionId = computed(() => authStore.user?.section_id)

const myLeaves = computed(() => leavesStore.records.filter(l => l.requesterId === studentId.value))

const leaveForm = ref({ type: 'full-day', date: '', periods: [], reason: '' })

const periods = [
  '08:00 - 09:00',
  '09:00 - 10:00',
  '10:00 - 11:00',
  '12:00 - 13:00',
  '13:00 - 14:00',
  '14:00 - 15:00'
]

watch(() => leaveForm.value.periods, (newVal) => {
  if (newVal.length === periods.length) {
    leaveForm.value.type = 'full-day'
    leaveForm.value.periods = []
  }
}, { deep: true })

const submitLeave = () => {
  if (!leaveForm.value.date || !leaveForm.value.reason) return
  
  if (leaveForm.value.type === 'class') {
    if (!leaveForm.value.periods || leaveForm.value.periods.length === 0) return
    
    
    const dateObj = new Date(leaveForm.value.date)
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayName = days[dateObj.getDay()]
    
    
    const sectionApptIds = appointmentsStore.appointments
      .filter(a => a.sectionId === sectionId.value)
      .map(a => a.id)
      
    leaveForm.value.periods.forEach(selectedPeriod => {
      let targetTeacherId = null
      
      const slot = timetablesStore.slots.find(s => 
        s.status === 'approved' && 
        s.day === dayName && 
        s.period === selectedPeriod &&
        sectionApptIds.includes(s.appointmentId)
      )
      
      if (slot) {
        const appt = appointmentsStore.appointments.find(a => a.id === slot.appointmentId)
        if (appt) targetTeacherId = appt.teacher_id
      }
      
      leavesStore.requestLeave({
        requesterId: studentId.value,
        requesterRole: 'student',
        type: 'class',
        date: leaveForm.value.date,
        period: selectedPeriod,
        reason: leaveForm.value.reason,
        targetTeacherId
      })
    })
  } else {
    leavesStore.requestLeave({
      requesterId: studentId.value,
      requesterRole: 'student',
      type: 'full-day',
      date: leaveForm.value.date,
      reason: leaveForm.value.reason
    })
  }
  
  leaveForm.value = { type: 'full-day', date: '', periods: [], reason: '' }
}
</script>

<template>
  <div class="flex flex-col h-full gap-8">
    
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="glass-panel p-6 rounded-3xl h-fit border border-white/60 bg-gradient-to-br from-white/90 to-white/50 shadow-xl shadow-slate-200/50 relative overflow-hidden">
        <div class="absolute -left-10 -bottom-10 w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-2xl pointer-events-none"></div>
        <h3 class="font-bold text-slate-800 text-lg mb-6 relative z-10">Submit Request</h3>
        
        <form @submit.prevent="submitLeave" class="flex flex-col gap-5 relative z-10">
          <div>
            <label class="block mb-2 text-sm font-bold text-slate-700">Leave Type</label>
            <select v-model="leaveForm.type" class="form-input shadow-sm" required>
              <option value="full-day">Full Day (HOD Approval)</option>
              <option value="class">Single Class (Teacher Approval)</option>
            </select>
          </div>
          <div>
            <label class="block mb-2 text-sm font-bold text-slate-700">Date</label>
            <input type="date" v-model="leaveForm.date" class="form-input shadow-sm" required />
          </div>
          <div v-if="leaveForm.type === 'class'">
            <label class="block mb-2 text-sm font-bold text-slate-700">Periods</label>
            <div class="grid grid-cols-2 gap-2">
              <button 
                v-for="period in periods" 
                :key="period" 
                type="button"
                @click="leaveForm.periods.includes(period) ? leaveForm.periods = leaveForm.periods.filter(p => p !== period) : leaveForm.periods.push(period)"
                class="px-3 py-2 rounded-xl text-xs font-bold transition-colors border text-left flex justify-between items-center"
                :class="leaveForm.periods.includes(period) ? 'bg-primary/10 border-primary text-primary-dark' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'"
              >
                {{ period }}
                <svg v-if="leaveForm.periods.includes(period)" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </button>
            </div>
            <p v-if="leaveForm.periods.length === 0" class="text-xs text-danger mt-2 font-medium">Please select at least one period.</p>
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
                <th class="py-3 px-6 text-xs uppercase tracking-wider font-bold text-slate-500">Details</th>
                <th class="py-3 px-6 text-xs uppercase tracking-wider font-bold text-slate-500">Reason</th>
                <th class="py-3 px-6 text-xs uppercase tracking-wider font-bold text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="leave in myLeaves" :key="leave.id" class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td class="py-4 px-6">
                  <div class="font-bold text-slate-800">{{ leave.date }}</div>
                  <div class="text-xs font-semibold text-primary mt-1">{{ leave.type === 'full-day' ? 'Full Day' : leave.period }}</div>
                </td>
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
  </div>
</template>
