<script setup>
import { computed, ref } from 'vue'
import { useAuthStore } from '../../store/auth'
import { useTimetablesStore } from '../../store/timetables'
import { useAppointmentsStore } from '../../store/appointments'
import { useInfrastructureStore } from '../../store/infrastructure'
import { useUsersStore } from '../../store/users'

const authStore = useAuthStore()
const timetablesStore = useTimetablesStore()
const appointmentsStore = useAppointmentsStore()
const infraStore = useInfrastructureStore()
const usersStore = useUsersStore()

const studentSectionId = computed(() => authStore.user?.sectionId)

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const timeSlots = [
  '08:00 - 09:00',
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 13:00',
  '13:00 - 14:00',
  '14:00 - 15:00'
]


const sectionSlots = computed(() => {
  if (!studentSectionId.value) return []
  
  
  const sectionAppts = appointmentsStore.appointments.filter(a => a.sectionId === studentSectionId.value)
  const apptIds = sectionAppts.map(a => a.id)
  
  
  const slots = timetablesStore.slots.filter(s => s.status === 'approved' && apptIds.some(id => String(id) === String(s.appointmentId)))
  
  
  return slots.map(slot => {
    const appt = sectionAppts.find(a => String(a.id) === String(slot.appointmentId))
    return {
      ...slot,
      subject: infraStore.subjects.find(s => String(s.id) === String(appt?.subjectId))?.name,
      teacher: usersStore.users.find(u => String(u.id) === String(appt?.teacherId))?.name,
      room: infraStore.rooms.find(r => String(r.id) === String(appt?.roomId))?.name
    }
  })
})

const getSlot = (day, period) => {
  if (period === '11:00 - 12:00') return 'BREAK'
  return sectionSlots.value.find(s => s.day === day && s.period === period)
}

const selectedSlot = ref(null)
const openSlotDetails = (slot) => {
  if (slot && slot !== 'BREAK') {
    selectedSlot.value = slot
  }
}
</script>

<template>
  <div class="flex flex-col h-full gap-8">
    
    
    <div v-if="!studentSectionId" class="glass-panel p-12 rounded-3xl text-center border border-warning/20 bg-warning/5">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto text-warning mb-4"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
      <h3 class="text-lg font-bold text-warning-dark mb-2">Unassigned Section</h3>
      <p class="text-warning-dark/80 max-w-md mx-auto">You have not been assigned to a class section yet. Please contact the administration to map your profile to a section.</p>
    </div>
    
    <div v-else class="flex-1 glass-panel rounded-3xl border border-white/60 bg-white/70 backdrop-blur-md shadow-xl overflow-hidden flex flex-col relative">
      <div class="absolute -right-20 -bottom-20 w-64 h-64 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div class="overflow-x-auto flex-1">
        <table class="w-full text-center border-collapse table-fixed min-w-[800px] h-full">
          <thead>
            <tr class="bg-slate-50/80 border-b border-slate-200">
              <th class="py-4 px-2 w-28 border-r border-slate-200 text-xs font-black text-slate-400 uppercase tracking-widest sticky left-0 z-20 bg-slate-50/95 backdrop-blur-sm shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">Time / Day</th>
              <th v-for="time in timeSlots" :key="time" class="py-4 px-2 text-xs font-black text-slate-500 uppercase tracking-wider border-r border-slate-200 last:border-r-0 leading-tight">
                {{ time }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="day in days" :key="day" class="border-b border-slate-200 last:border-b-0 h-[100px]">
              <td class="py-2 px-2 font-black text-slate-700 bg-slate-50/80 border-r border-slate-200 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                {{ day }}
              </td>
              
              <td v-for="(time, idx) in timeSlots" :key="time" class="p-2 border-r border-slate-200 last:border-r-0 relative group transition-colors" :class="getSlot(day, time) === 'BREAK' ? 'bg-slate-100/50' : 'hover:bg-primary/5'">
                
                <div v-if="getSlot(day, time) === 'BREAK'" class="h-full flex items-center justify-center">
                  <span v-if="day === 'Wednesday'" class="text-slate-300 font-black tracking-[0.3em] uppercase rotate-90 whitespace-nowrap opacity-50">BREAK</span>
                </div>
                
                
                <div v-else-if="getSlot(day, time)" @click="openSlotDetails(getSlot(day, time))" class="h-full w-full cursor-pointer bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-2 flex flex-col justify-center text-left shadow-sm relative overflow-hidden group-hover:shadow-md transition-all">
                  <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-accent"></div>
                  <h4 class="font-bold text-slate-800 text-sm leading-tight truncate">{{ getSlot(day, time).subject }}</h4>
                  <div class="mt-1 flex flex-col gap-0.5">
                    <span class="text-[10px] font-semibold text-slate-600 truncate">{{ getSlot(day, time).teacher }}</span>
                    <span class="text-[10px] font-bold text-primary truncate bg-white/50 w-fit px-1.5 rounded">{{ getSlot(day, time).room }}</span>
                  </div>
                </div>
                
                
                <div v-else class="h-full w-full rounded-xl border border-dashed border-slate-200/60 flex items-center justify-center">
                  <span class="text-[10px] font-medium text-slate-300">Free</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    
    <div v-if="selectedSlot" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" @click.self="selectedSlot = null">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div class="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-primary/10 to-white">
          <h3 class="text-xl font-bold text-slate-800">Class Details</h3>
        </div>
        
        <div class="p-6 space-y-4">
          <div>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Subject</p>
            <p class="text-lg font-black text-slate-800">{{ selectedSlot.subject }}</p>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Time</p>
              <p class="text-sm font-bold text-slate-700">{{ selectedSlot.day }}, {{ selectedSlot.period }}</p>
            </div>
            <div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Room</p>
              <p class="text-sm font-bold text-slate-700">{{ selectedSlot.room }}</p>
            </div>
          </div>
          
          <div>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Instructor</p>
            <p class="text-sm font-bold text-slate-700">{{ selectedSlot.teacher }}</p>
          </div>
        </div>
        
        <div class="p-4 bg-slate-50 flex justify-end">
          <button @click="selectedSlot = null" class="px-6 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors shadow-sm">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>
