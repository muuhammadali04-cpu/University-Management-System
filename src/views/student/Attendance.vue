<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../../store/auth'
import { useAttendanceStore } from '../../store/attendance'
import { useAppointmentsStore } from '../../store/appointments'
import { useInfrastructureStore } from '../../store/infrastructure'

const authStore = useAuthStore()
const attendanceStore = useAttendanceStore()
const appointmentsStore = useAppointmentsStore()
const infraStore = useInfrastructureStore()

const studentId = computed(() => authStore.user?.id)

const attendanceHistory = computed(() => {
  if (!studentId.value) return []
  
  const records = attendanceStore.getAttendanceForStudent(studentId.value)
  return records.map(r => {
    return {
      ...r,
      subject: infraStore.subjects.find(s => s.id === r.subject_id)?.name || 'Unknown'
    }
  }).sort((a, b) => new Date(b.date) - new Date(a.date))
})

const stats = computed(() => {
  const records = attendanceHistory.value
  if (records.length === 0) return { present: 0, absent: 0, late: 0, leave: 0, percentage: 100 }
  
  const present = records.filter(r => r.status === 'Present').length
  const absent = records.filter(r => r.status === 'Absent').length
  const late = records.filter(r => r.status === 'Late').length
  const leave = records.filter(r => r.status === 'Leave').length
  
  
  const totalEffective = present + absent + late
  const score = present + (late * 0.5)
  const percentage = totalEffective > 0 ? Math.round((score / totalEffective) * 100) : 100
  
  return { present, absent, late, leave, percentage }
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div class="flex flex-col h-full gap-8">
    
    
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      <div class="lg:col-span-1 flex flex-col gap-6">
        <div class="glass-panel p-6 rounded-3xl border border-white/60 bg-gradient-to-br from-white/90 to-white/50 shadow-xl shadow-slate-200/50 flex flex-col items-center justify-center relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-b from-primary/5 to-accent/5 pointer-events-none"></div>
          <h3 class="font-bold text-slate-500 text-sm uppercase tracking-widest mb-4">Overall Score</h3>
          <div class="relative w-32 h-32 flex items-center justify-center mb-2">
            <svg class="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path class="text-slate-100" stroke-width="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path :class="stats.percentage >= 75 ? 'text-success' : 'text-danger'" stroke-dasharray="100, 100" :stroke-dashoffset="100 - stats.percentage" stroke-width="3" stroke-linecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-3xl font-black text-slate-800">{{ stats.percentage }}%</span>
            </div>
          </div>
          <p v-if="stats.percentage < 75" class="text-xs font-bold text-danger text-center mt-2">Warning: Low Attendance</p>
        </div>
        
        <div class="glass-panel p-6 rounded-3xl border border-white/60 bg-white/70 shadow-xl shadow-slate-200/50">
          <div class="flex flex-col gap-4">
            <div class="flex justify-between items-center">
              <span class="text-sm font-bold text-slate-600 flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-success"></span> Present</span>
              <span class="font-black text-slate-800">{{ stats.present }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm font-bold text-slate-600 flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-danger"></span> Absent</span>
              <span class="font-black text-slate-800">{{ stats.absent }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm font-bold text-slate-600 flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-warning"></span> Late</span>
              <span class="font-black text-slate-800">{{ stats.late }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm font-bold text-slate-600 flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-slate-400"></span> On Leave</span>
              <span class="font-black text-slate-800">{{ stats.leave }}</span>
            </div>
          </div>
        </div>
      </div>
      
      
      <div class="lg:col-span-3 glass-panel rounded-3xl border border-white/60 bg-white/70 backdrop-blur-md shadow-xl overflow-hidden flex flex-col">
        <div class="px-6 py-5 border-b border-slate-200/60 bg-slate-50/50 flex justify-between items-center">
          <h3 class="font-bold text-slate-800">Detailed Log</h3>
        </div>
        
        <div class="flex-1 overflow-y-auto p-0">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200">
                <th class="py-3 px-6 text-xs uppercase tracking-wider font-bold text-slate-500">Date</th>
                <th class="py-3 px-6 text-xs uppercase tracking-wider font-bold text-slate-500">Subject</th>
                <th class="py-3 px-6 text-xs uppercase tracking-wider font-bold text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in attendanceHistory" :key="record.id" class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td class="py-4 px-6 font-bold text-slate-800">{{ formatDate(record.date) }}</td>
                <td class="py-4 px-6 font-medium text-slate-600">{{ record.subject }}</td>
                <td class="py-4 px-6">
                  <span class="px-3 py-1 rounded-full text-xs font-bold" :class="{
                    'bg-success/20 text-success-dark': record.status === 'Present',
                    'bg-danger/20 text-danger': record.status === 'Absent',
                    'bg-warning/20 text-warning-dark': record.status === 'Late',
                    'bg-slate-200 text-slate-600': record.status === 'Leave'
                  }">{{ record.status.toUpperCase() }}</span>
                </td>
              </tr>
              <tr v-if="attendanceHistory.length === 0">
                <td colspan="3" class="py-12 text-center text-slate-500 font-medium">No attendance records found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
