<script setup>
import { useAttendanceStore } from '../../store/attendance'
import { useUsersStore } from '../../store/users'
import { computed, ref } from 'vue'

const attendanceStore = useAttendanceStore()
const usersStore = useUsersStore()

const allRecords = computed(() => attendanceStore.records)
const students = computed(() => usersStore.getUsersByRole('student'))


const getStudentName = (id) => {
  return students.value.find(s => s.id === id)?.name || 'Unknown Student'
}


const studentBatches = computed(() => {
  const uniqueBatches = new Set(students.value.map(s => s.batch).filter(Boolean))
  return ['All', ...Array.from(uniqueBatches)]
})
const activeBatch = ref('All')
const searchQuery = ref('')

const filteredRecords = computed(() => {
  let records = allRecords.value

  if (activeBatch.value !== 'All') {
    const batchStudentIds = students.value.filter(s => s.batch === activeBatch.value).map(s => s.id)
    records = records.filter(r => batchStudentIds.includes(r.studentId))
  }

  if (searchQuery.value) {
    const lowerQuery = searchQuery.value.toLowerCase()
    records = records.filter(r => {
      const studentName = getStudentName(r.studentId).toLowerCase()
      return studentName.includes(lowerQuery) || r.studentId.toLowerCase().includes(lowerQuery)
    })
  }

  return records
})

const exportCSV = () => {
  if (filteredRecords.value.length === 0) return

  const headers = ['Record ID', 'Date', 'Student ID', 'Student Name', 'Appointment ID', 'Status']
  const rows = filteredRecords.value.map(r => [
    String(r.id).slice(-5),
    r.date,
    r.studentId,
    getStudentName(r.studentId),
    r.appointmentId,
    r.status
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(e => e.map(val => `"${val}"`).join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `attendance_export_${new Date().getTime()}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<template>
  <div class="flex flex-col h-full gap-8 relative">
    <div class="glass-panel p-8 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between border-l-4 border-l-primary relative overflow-hidden">
      <div class="relative z-10">
        <h2 class="text-2xl font-bold text-slate-800 tracking-tight">University Attendance Log</h2>
        <p class="text-slate-500 font-medium mt-1">Global oversight of all student attendance records.</p>
      </div>
      <div class="mt-6 sm:mt-0 relative z-10 flex gap-4 items-center">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search by student name or ID..." 
          class="px-4 py-2 bg-white/70 border border-slate-200 rounded-xl shadow-inner focus:outline-none focus:border-primary text-sm min-w-[250px]"
        />
        <button @click="exportCSV" class="px-6 py-2.5 bg-white text-slate-700 border border-slate-200 font-bold rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
          Export CSV
        </button>
      </div>
    </div>

    
    <div class="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
      <button 
        v-for="batch in studentBatches" :key="batch"
        @click="activeBatch = batch"
        class="px-5 py-2 rounded-lg font-bold text-sm transition-all"
        :class="activeBatch === batch ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'"
      >
        {{ batch }}
      </button>
    </div>

    <div class="glass-panel p-6 rounded-3xl flex-1 bg-white/50 border border-white/60 overflow-hidden flex flex-col">
      <div v-if="filteredRecords.length === 0" class="flex flex-col items-center justify-center py-16 text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-4 opacity-50"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        <p class="text-lg font-semibold">No attendance records found.</p>
        <p class="text-sm">Try adjusting your search or batch filter.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">
              <th class="p-4">Record ID</th>
              <th class="p-4">Date</th>
              <th class="p-4">Student</th>
              <th class="p-4">Class Ref</th>
              <th class="p-4">Status</th>
            </tr>
          </thead>
          <tbody class="text-sm font-medium text-slate-600">
            <tr v-for="record in filteredRecords" :key="record.id" class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
              <td class="p-4 text-slate-400">#{{ String(record.id).slice(-5) }}</td>
              <td class="p-4 font-bold text-slate-800">{{ record.date }}</td>
              <td class="p-4 text-primary">
                <div class="flex flex-col">
                  <span>{{ getStudentName(record.studentId) }}</span>
                  <span class="text-xs font-medium text-slate-400">{{ record.studentId }}</span>
                </div>
              </td>
              <td class="p-4 text-slate-500">APPT-{{ record.appointmentId }}</td>
              <td class="p-4">
                <span class="px-3 py-1 rounded-full text-xs font-bold" 
                  :class="{
                    'bg-emerald-100 text-emerald-700': record.status === 'Present',
                    'bg-rose-100 text-rose-700': record.status === 'Absent',
                    'bg-amber-100 text-amber-700': record.status === 'Late',
                    'bg-sky-100 text-sky-700': record.status === 'Leave'
                  }">
                  {{ record.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
