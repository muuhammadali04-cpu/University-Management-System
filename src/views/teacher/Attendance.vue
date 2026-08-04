<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../store/auth'
import { useAppointmentsStore } from '../../store/appointments'
import { useInfrastructureStore } from '../../store/infrastructure'
import { useUsersStore } from '../../store/users'
import { useAttendanceStore } from '../../store/attendance'
import { useNotificationStore } from '../../store/notifications'

const authStore = useAuthStore()
const appointmentsStore = useAppointmentsStore()
const infraStore = useInfrastructureStore()
const usersStore = useUsersStore()
const attendanceStore = useAttendanceStore()
const notifStore = useNotificationStore()

onMounted(() => {
  appointmentsStore.fetchAppointments()
  attendanceStore.fetchAttendance()
})

const teacherId = computed(() => authStore.user?.id)

const myClasses = computed(() => {
  return appointmentsStore.appointments
    .filter(a => a.teacher_id === teacherId.value)
    .map(a => ({
      ...a,
      subject: infraStore.subjects.find(s => s.id === a.subject_id),
      section: infraStore.sections.find(s => s.id === a.section_id),
      room: infraStore.rooms.find(r => r.id === a.room_id)
    }))
})

const selectedClass = ref(null)
const selectClass = (cls) => {
  selectedClass.value = cls
}
const attendanceDate = ref(new Date().toISOString().split('T')[0])

const classStudents = computed(() => {
  if (!selectedClass.value) return []
  return usersStore.users.filter(u => u.role === 'student' && u.section_id === selectedClass.value.section_id)
})

const getAttendance = (studentId) => {
  if (!selectedClass.value) return 'Present'
  const record = attendanceStore.records.find(r => 
    r.subject_id === selectedClass.value.subject_id && 
    r.date === attendanceDate.value && 
    r.student_id === studentId
  )
  return record ? record.status : 'Present' 
}

const updateAttendance = (studentId, status) => {
  if (!selectedClass.value) return
  attendanceStore.markAttendance(selectedClass.value.subject_id, attendanceDate.value, studentId, status)
}

const showToast = ref(false)
const toastMessage = ref('')

const saveAttendance = () => {
  toastMessage.value = `Attendance saved for ${attendanceDate.value}`
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 3000)
}
</script>

<template>
  <div class="flex flex-col h-full gap-8 relative">
    
    
    <transition enter-active-class="transition duration-300 ease-out" enter-from-class="transform translate-y-2 opacity-0" enter-to-class="transform translate-y-0 opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="transform translate-y-0 opacity-100" leave-to-class="transform translate-y-2 opacity-0">
      <div v-if="showToast" class="fixed bottom-10 right-10 z-[100] bg-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700">
        <div class="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        </div>
        <span class="font-medium">{{ toastMessage }}</span>
      </div>
    </transition>
    
    <div v-if="!selectedClass" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="cls in myClasses" :key="cls.id" @click="selectClass(cls)" class="glass-panel p-6 rounded-3xl cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20 transition-all border border-white/60 bg-gradient-to-br from-white/90 to-white/50 group relative overflow-hidden">
        <div class="absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors"></div>
        <div class="flex items-center gap-4 mb-4">
          <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          </div>
          <div>
            <h3 class="font-bold text-slate-800 text-lg leading-tight">{{ cls.subject?.name }}</h3>
            <span class="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{{ cls.subject?.code }}</span>
          </div>
        </div>
        <div class="space-y-2 mt-6">
          <div class="flex items-center text-sm text-slate-600 gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span class="font-medium">Section: <span class="text-slate-800 font-bold">{{ cls.section?.name }}</span></span>
          </div>
          <div class="flex items-center text-sm text-slate-600 gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400"><path d="M3 21h18"></path><path d="M9 8h1"></path><path d="M9 12h1"></path><path d="M9 16h1"></path><path d="M14 8h1"></path><path d="M14 12h1"></path><path d="M14 16h1"></path><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"></path></svg>
            <span class="font-medium">Room: <span class="text-slate-800 font-bold">{{ cls.room?.name }}</span></span>
          </div>
        </div>
        <div class="mt-6 pt-4 border-t border-slate-200/60">
          <button class="w-full py-2.5 bg-slate-100 hover:bg-primary hover:text-white text-primary font-bold rounded-xl transition-colors flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-white">
            Manage Class
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="group-hover:translate-x-1 transition-transform"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>
        </div>
      </div>
      
      <div v-if="myClasses.length === 0" class="col-span-full py-12 flex flex-col items-center justify-center bg-white/40 rounded-3xl border border-dashed border-slate-300">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400 mb-4"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <h3 class="text-lg font-bold text-slate-700">No classes assigned</h3>
        <p class="text-slate-500">You currently do not have any appointments.</p>
      </div>
    </div>
    
    <div v-else class="flex flex-col h-full bg-white/70 backdrop-blur-md rounded-3xl border border-white/60 shadow-xl overflow-hidden">
      
      <div class="px-8 py-6 border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-white flex justify-between items-center">
        <div>
          <button @click="selectedClass = null" class="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </button>
          <h2 class="text-2xl font-black text-slate-800 tracking-tight">{{ selectedClass.subject?.name }} <span class="text-slate-400 font-medium">| {{ selectedClass.section?.name }}</span></h2>
        </div>
      </div>
      
      
      <div class="p-8 flex-1 flex flex-col overflow-hidden">
        <div class="flex justify-between items-center mb-6">
          <h3 class="font-bold text-slate-700 text-lg">Mark Attendance</h3>
          <input type="date" v-model="attendanceDate" class="form-input w-48 shadow-sm" required />
        </div>
        
        <div class="flex-1 overflow-y-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-200">
                <th class="py-3 px-4 text-xs uppercase tracking-wider font-bold text-slate-500">Student Name</th>
                <th class="py-3 px-4 text-xs uppercase tracking-wider font-bold text-slate-500 w-48 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in classStudents" :key="student.id" class="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                <td class="py-4 px-4 font-bold text-slate-800">{{ student.name }} <span class="text-xs font-normal text-slate-400 ml-2">ID: {{ student.id }}</span></td>
                <td class="py-4 px-4 text-right">
                  <select :value="getAttendance(student.id)" @change="e => updateAttendance(student.id, e.target.value)" 
                    class="form-input shadow-sm w-36 text-sm font-bold border-2"
                    :class="{
                      'bg-success/10 text-success-dark border-success/30': getAttendance(student.id) === 'Present',
                      'bg-danger/10 text-danger-dark border-danger/30': getAttendance(student.id) === 'Absent',
                      'bg-warning/10 text-warning-dark border-warning/30': getAttendance(student.id) === 'Late',
                      'bg-slate-100 text-slate-600 border-slate-300': getAttendance(student.id) === 'Leave'
                    }">
                    <option value="Present" class="text-slate-800">Present</option>
                    <option value="Absent" class="text-slate-800">Absent</option>
                    <option value="Late" class="text-slate-800">Late</option>
                    <option value="Leave" class="text-slate-800">On Leave</option>
                  </select>
                </td>
              </tr>
              <tr v-if="classStudents.length === 0">
                <td colspan="2" class="py-8 text-center text-slate-500 font-medium">No students enrolled in this section.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pt-6 border-t border-slate-200 flex justify-end">
          <button @click="saveAttendance" class="btn-primary shadow-lg shadow-primary/20 px-8">Save Attendance</button>
        </div>
      </div>
    </div>
  </div>
</template>
