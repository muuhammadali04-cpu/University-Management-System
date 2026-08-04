<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTimetablesStore } from '../../store/timetables'
import { useAppointmentsStore } from '../../store/appointments'
import { useAuthStore } from '../../store/auth'
import { useInfrastructureStore } from '../../store/infrastructure'

const authStore = useAuthStore()
const ttStore = useTimetablesStore()
const apptStore = useAppointmentsStore()
const infraStore = useInfrastructureStore()

onMounted(() => {
  apptStore.fetchAppointments()
  ttStore.fetchTimetables()
})

const teacherId = computed(() => authStore.user?.id)

const myAppointments = computed(() => apptStore.appointments.filter(a => a.teacher_id === teacherId.value))

const getSubjectName = (id) => infraStore.subjects.find(s => s.id === id)?.name || 'Unknown'
const getRoomName = (id) => infraStore.rooms.find(r => r.id === id)?.name || 'Unknown'
const getSectionName = (id) => infraStore.sections.find(s => s.id === id)?.name || 'Unknown'

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const periods = ['08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00']
const breakPeriod = '11:00 - 12:00'

const mySlots = computed(() => {
  return ttStore.slots.filter(s => myAppointments.value.some(a => a.id === s.appointmentId))
})

const getSlot = (day, period) => {
  return mySlots.value.find(s => s.day === day && s.period === period)
}

const showModal = ref(false)
const selectedDay = ref('')
const selectedPeriod = ref('')
const selectedAppt = ref('')

const openSlotModal = (day, period) => {
  const existing = getSlot(day, period)
  if (existing) {
    if (existing.status === 'pending' || existing.status === 'rejected') {
      if (confirm(`Remove this ${existing.status} request?`)) ttStore.deleteSlot(existing.id)
    } else {
      alert("This slot is already approved. Contact HOD to make changes.")
    }
    return
  }
  
  if (myAppointments.value.length === 0) {
    alert("You have no class assignments yet. If you want to teach a specific subject, contact your HOD.")
    return
  }

  selectedDay.value = day
  selectedPeriod.value = period
  selectedAppt.value = myAppointments.value[0]?.id || ''
  showModal.value = true
}

const submitRequest = () => {
  if (selectedAppt.value) {
    ttStore.requestSlot(selectedAppt.value, selectedDay.value, selectedPeriod.value)
  }
  showModal.value = false
}
</script>

<template>
  <div class="flex flex-col gap-6 h-full pb-8">
    
    <div class="glass-panel overflow-hidden flex-1 flex flex-col min-h-[600px] rounded-2xl">
      <div class="p-6 border-b border-slate-100 bg-white/50 flex justify-between items-center shrink-0">
        <div>
          <h3 class="font-bold text-slate-800 text-xl">My Timetable Builder</h3>
          <p class="text-sm text-slate-500 font-medium">Click any empty cell to request a slot assignment from your HOD.</p>
        </div>
        <div class="flex gap-5 text-xs font-bold text-slate-600 bg-white/70 backdrop-blur-md px-5 py-2.5 rounded-xl shadow-sm border border-slate-100">
          <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span> Approved</div>
          <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50 animate-pulse"></span> Pending</div>
          <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></span> Rejected</div>
        </div>
      </div>
      
      <div class="overflow-x-auto overflow-y-auto flex-1 hide-scrollbar relative bg-slate-50/30">
        
        <table class="w-full table-fixed text-left border-collapse min-w-[900px] h-full">
          <thead>
            <tr>
              <th class="w-24 p-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider border-b-2 border-r border-slate-200 bg-white/50 sticky left-0 z-20">Day \ Time</th>
              <template v-for="period in periods" :key="period">
                <th v-if="period === breakPeriod" class="w-16 p-3 text-center text-xs font-bold text-slate-400 border-b-2 border-slate-200 bg-slate-100/50">BREAK</th>
                <th v-else class="p-3 text-center text-xs font-bold text-slate-700 border-b-2 border-slate-200 bg-white/50">{{ period }}</th>
              </template>
            </tr>
          </thead>
          <tbody>
            <tr v-for="day in days" :key="day" class="group/row hover:bg-white/40 transition-colors">
              <td class="p-3 text-center text-sm font-bold text-slate-600 border-b border-r border-slate-200 bg-white/50 sticky left-0 z-20">{{ day }}</td>
              
              <template v-for="(period, index) in periods" :key="period">
                
                <td v-if="period === breakPeriod" class="border-b border-r border-slate-200 bg-slate-100/50 text-center p-0 align-middle">
                  <div v-if="index === 3 && day === 'Wednesday'" class="text-sm font-black text-slate-300 tracking-[0.3em] uppercase rotate-[-90deg] whitespace-nowrap transform -translate-y-4">
                    BREAK
                  </div>
                </td>
                
                
                <td v-else class="p-2 border-b border-r border-slate-200 relative group h-28 hover:bg-slate-50/50 transition-colors">
                  
                  <div 
                    @click="openSlotModal(day, period)"
                    class="absolute inset-1.5 rounded-xl p-2 flex flex-col justify-center items-center text-center cursor-pointer transition-all duration-300 border-2"
                    :class="[
                      getSlot(day, period) 
                        ? (getSlot(day, period).status === 'approved' 
                            ? 'bg-emerald-50 border-emerald-200 hover:border-emerald-300 hover:shadow-md' 
                            : getSlot(day, period).status === 'pending'
                              ? 'bg-amber-50 border-amber-300 hover:border-amber-400 border-dashed hover:shadow-md'
                              : 'bg-rose-50 border-rose-200 hover:border-rose-300 line-through opacity-70 hover:opacity-100')
                        : 'border-transparent hover:border-slate-300 hover:bg-white/80 hover:shadow-sm'
                    ]"
                  >
                    <template v-if="getSlot(day, period)">
                      <span class="font-bold text-base mb-1" :class="[
                        getSlot(day, period).status === 'approved' ? 'text-emerald-700' : 
                        getSlot(day, period).status === 'pending' ? 'text-amber-700' : 'text-rose-700'
                      ]">
                        {{ getSubjectName(apptStore.appointments.find(a => a.id === getSlot(day, period).appointmentId)?.subject_id) }}
                      </span>
                      <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/60">
                        <span class="text-xs font-bold" :class="[
                          getSlot(day, period).status === 'approved' ? 'text-emerald-600' : 
                          getSlot(day, period).status === 'pending' ? 'text-amber-600' : 'text-rose-600'
                        ]">
                          {{ getRoomName(apptStore.appointments.find(a => a.id === getSlot(day, period).appointmentId)?.room_id) }}
                        </span>
                        <span class="text-slate-300 text-xs">|</span>
                        <span class="text-xs font-bold" :class="[
                          getSlot(day, period).status === 'approved' ? 'text-emerald-600' : 
                          getSlot(day, period).status === 'pending' ? 'text-amber-600' : 'text-rose-600'
                        ]">
                          {{ getSectionName(apptStore.appointments.find(a => a.id === getSlot(day, period).appointmentId)?.section_id) }}
                        </span>
                      </div>
                    </template>
                    <template v-else>
                      <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 group-hover:text-primary group-hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100 transform group-hover:scale-110">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      </div>
                    </template>
                  </div>

                </td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div class="p-6 border-b border-slate-100">
            <h3 class="text-xl font-bold text-slate-800">Request Slot</h3>
            <p class="text-sm text-slate-500 mt-1 font-medium">{{ selectedDay }} at {{ selectedPeriod }}</p>
          </div>
          
          <div class="p-6 space-y-4 bg-slate-50/50">
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-2">Select Assignment</label>
              <select v-model="selectedAppt" class="form-input bg-white shadow-sm border-slate-200">
                <option v-for="appt in myAppointments" :key="appt.id" :value="appt.id">
                  {{ getSubjectName(appt.subject_id) }} ({{ getSectionName(appt.section_id) }}) - {{ getRoomName(appt.room_id) }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="p-6 bg-white flex justify-end gap-3 border-t border-slate-100">
            <button @click="showModal = false" class="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
            <button @click="submitRequest" class="px-6 py-2.5 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-700 shadow-md transition-colors">Submit Request</button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>
