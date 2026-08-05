<script setup>
import { ref, computed } from 'vue'
import { useTimetablesStore } from '../../store/timetables'
import { useAppointmentsStore } from '../../store/appointments'
import { useUsersStore } from '../../store/users'
import { useInfrastructureStore } from '../../store/infrastructure'

const ttStore = useTimetablesStore()
const apptStore = useAppointmentsStore()
const userStore = useUsersStore()
const infraStore = useInfrastructureStore()

import { onMounted } from 'vue'
onMounted(() => {
  apptStore.fetchAppointments()
  ttStore.fetchTimetables()
})

const getTeacherName = (id) => userStore.users.find(u => u.id === id)?.name || 'Unknown'
const getSubjectName = (id) => infraStore.subjects.find(s => s.id === id)?.name || 'Unknown'
const getRoomName = (id) => infraStore.rooms.find(r => r.id === id)?.name || 'Unknown'
const getSectionName = (id) => infraStore.sections.find(s => s.id === id)?.name || 'Unknown'


const filterType = ref('section')
const filterId = ref('')

const filterOptions = computed(() => {
  if (filterType.value === 'section') return infraStore.sections
  if (filterType.value === 'teacher') return userStore.users.filter(u => u.role === 'teacher')
  if (filterType.value === 'room') return infraStore.rooms
  return []
})

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const periods = ['08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00']
const breakPeriod = '11:00 - 12:00'

const getGridSlot = (day, period) => {
  if (!filterId.value) return null
  
  return ttStore.slots.find(s => {
    if (s.status !== 'approved') return false
    if (s.day !== day || s.period !== period) return false
    
    const appt = apptStore.appointments.find(a => a.id === s.appointmentId)
    if (!appt) return false
    
    if (filterType.value === 'section') return appt.section_id === filterId.value
    if (filterType.value === 'teacher') return appt.teacher_id === filterId.value
    if (filterType.value === 'room') return appt.room_id === filterId.value
    return false
  })
}


const showModal = ref(false)
const newSlot = ref({ teacherId: '', subjectId: '', roomId: '', sectionId: '', day: '', period: '' })
const teachers = computed(() => userStore.users.filter(u => u.role === 'teacher'))

const openCreateModal = (day, period) => {
  newSlot.value = { teacherId: '', subjectId: '', roomId: '', sectionId: '', day, period }
  showModal.value = true
}

const handleCreateSlot = async () => {
  if (!newSlot.value.teacherId || !newSlot.value.subjectId || !newSlot.value.roomId || !newSlot.value.sectionId || !newSlot.value.day || !newSlot.value.period) {
    alert("Please fill all fields to create a slot.")
    return
  }

  let appt = apptStore.appointments.find(a =>
    a.teacher_id === newSlot.value.teacherId &&
    a.subject_id === newSlot.value.subjectId &&
    a.room_id === newSlot.value.roomId &&
    a.section_id === newSlot.value.sectionId
  )

  try {
    if (!appt) {
      // Must be awaited so we get back the real DB-generated id - using a
      // fake client-side id here previously meant the created timetable
      // slot pointed at an appointment that didn't actually exist.
      appt = await apptStore.addAppointment({
        teacherId: newSlot.value.teacherId,
        subjectId: newSlot.value.subjectId,
        roomId: newSlot.value.roomId,
        sectionId: newSlot.value.sectionId
      })
    }

    const result = await ttStore.createApprovedSlot(appt.id, newSlot.value.day, newSlot.value.period)
    if (!result.success) {
      alert("Conflict Prevented:\n\n" + result.message)
    } else {
      showModal.value = false
    }
  } catch (e) {
    alert('Could not create slot: ' + e.message)
  }
}
</script>

<template>
  <div class="flex flex-col h-full pb-8">
    
    <div class="glass-panel overflow-hidden flex-1 flex flex-col min-h-[600px] rounded-2xl">
      <div class="p-6 border-b border-slate-100 bg-white/50 flex justify-between items-center shrink-0">
        <h3 class="font-bold text-slate-800 text-xl">Master Timetable Viewer</h3>
        
        <div class="flex gap-4 items-center bg-white/70 backdrop-blur-md px-4 py-2 rounded-xl shadow-sm border border-slate-100">
          <label class="text-sm font-bold text-slate-600">View By:</label>
          <select v-model="filterType" @change="filterId = ''" class="form-input py-2 text-sm w-40 bg-transparent border-slate-200">
            <option value="section">Section</option>
            <option value="teacher">Teacher</option>
            <option value="room">Room</option>
          </select>
          
          <select v-model="filterId" class="form-input py-2 text-sm w-48 bg-transparent border-slate-200" :disabled="!filterType">
            <option value="">Select {{ filterType }}...</option>
            <option v-for="opt in filterOptions" :key="opt.id" :value="opt.id">
              {{ opt.name }}
            </option>
          </select>
        </div>
      </div>
      
      <div class="overflow-x-auto overflow-y-auto flex-1 hide-scrollbar relative bg-slate-50/30">
        
        
        <div v-if="!filterId" class="absolute inset-0 z-10 bg-slate-50/50 backdrop-blur-[3px] flex items-center justify-center">
          <div class="bg-white/90 backdrop-blur-xl px-8 py-6 rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 text-center animate-in zoom-in-95 duration-300">
            <h4 class="text-xl font-bold text-slate-800 mb-2">Select a {{ filterType }}</h4>
            <p class="text-sm text-slate-500 font-medium">Choose an option from the dropdown above to view the timetable layout.</p>
          </div>
        </div>

        <table class="w-full table-fixed text-left border-collapse min-w-[900px] h-full" :class="!filterId && 'opacity-30'">
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
                  
                  
                  <div v-if="filterId && getGridSlot(day, period)" class="absolute inset-1.5 rounded-xl p-2 flex flex-col justify-center items-center text-center bg-gradient-to-br from-white to-slate-50 border border-slate-200 shadow-sm shadow-slate-200/50 hover:shadow-md transition-shadow">
                    <span class="font-bold text-xs text-primary mb-0.5 truncate w-full">
                      {{ getSubjectName(apptStore.appointments.find(a => a.id === getGridSlot(day, period).appointmentId)?.subject_id) }}
                    </span>
                    
                    <span v-if="filterType !== 'teacher'" class="text-[10px] font-bold text-slate-700 mb-0.5 truncate w-full">
                      {{ getTeacherName(apptStore.appointments.find(a => a.id === getGridSlot(day, period).appointmentId)?.teacher_id) }}
                    </span>
                    
                    <div class="flex items-center justify-center gap-1 mt-0.5 w-full">
                      <span v-if="filterType !== 'room'" class="text-[10px] font-bold text-slate-600 truncate">{{ getRoomName(apptStore.appointments.find(a => a.id === getGridSlot(day, period).appointmentId)?.room_id) }}</span>
                      <span v-if="filterType !== 'room' && filterType !== 'section'" class="text-slate-300 text-[10px]">-</span>
                      <span v-if="filterType !== 'section'" class="text-[10px] font-bold text-slate-600 truncate">{{ getSectionName(apptStore.appointments.find(a => a.id === getGridSlot(day, period).appointmentId)?.section_id) }}</span>
                    </div>
                  </div>
                  
                  
                  <div v-if="filterId && !getGridSlot(day, period)" class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50/20 backdrop-blur-[1px]">
                    <button @click="openCreateModal(day, period)" class="p-3 bg-white rounded-full text-slate-400 hover:text-primary hover:bg-primary/5 shadow-lg border border-slate-200 hover:border-primary/30 hover:scale-110 transition-all duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
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
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div class="p-6 border-b border-slate-100">
            <h3 class="text-xl font-bold text-slate-800">Assign Slot Directly</h3>
            <p class="text-sm text-slate-500 mt-1">{{ newSlot.day }} at {{ newSlot.period }}</p>
          </div>
          
          <div class="p-6 space-y-4 bg-slate-50/50">
            <div class="grid grid-cols-2 gap-5">
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-2">Teacher</label>
                <select v-model="newSlot.teacherId" class="form-input bg-white shadow-sm border-slate-200">
                  <option v-for="t in teachers" :key="t.id" :value="t.id">{{ t.name }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-2">Subject</label>
                <select v-model="newSlot.subjectId" class="form-input bg-white shadow-sm border-slate-200">
                  <option v-for="s in infraStore.subjects" :key="s.id" :value="s.id">{{ s.name }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-2">Room</label>
                <select v-model="newSlot.roomId" class="form-input bg-white shadow-sm border-slate-200">
                  <option v-for="r in infraStore.rooms" :key="r.id" :value="r.id">{{ r.name }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-2">Section</label>
                <select v-model="newSlot.sectionId" class="form-input bg-white shadow-sm border-slate-200">
                  <option v-for="s in infraStore.sections" :key="s.id" :value="s.id">{{ s.name }}</option>
                </select>
              </div>
            </div>
          </div>
          
          <div class="p-6 bg-white flex justify-end gap-3 border-t border-slate-100">
            <button @click="showModal = false" class="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
            <button @click="handleCreateSlot" class="px-6 py-2.5 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-700 shadow-md transition-colors">Assign Slot</button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>
