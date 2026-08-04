<script setup>
import { useAuthStore } from '../../store/auth'
import { useAttendanceStore } from '../../store/attendance'
import { useGradesStore } from '../../store/grades'
import { computed, ref, onMounted } from 'vue'
import NoticeBoard from '../../components/common/NoticeBoard.vue'

import { useUsersStore } from '../../store/users'
import { useLibraryStore } from '../../store/library'
import { useFinanceStore } from '../../store/finance'

const authStore = useAuthStore()
const attendanceStore = useAttendanceStore()
const gradesStore = useGradesStore()
const usersStore = useUsersStore()
const libraryStore = useLibraryStore()
const financeStore = useFinanceStore()

const user = computed(() => authStore.user)

const showToast = ref(false)

onMounted(() => {
  if (!sessionStorage.getItem('welcomeToastShown')) {
    setTimeout(() => { showToast.value = true }, 300)
    setTimeout(() => { showToast.value = false }, 4000)
    sessionStorage.setItem('welcomeToastShown', 'true')
  }
})

const studentStats = computed(() => {
  if (user.value?.role !== 'student') return null
  
  
  const attRecords = attendanceStore.getAttendanceForStudent(user.value.id)
  let attPercentage = 100
  if (attRecords.length > 0) {
    const present = attRecords.filter(r => r.status === 'Present').length
    const absent = attRecords.filter(r => r.status === 'Absent').length
    const late = attRecords.filter(r => r.status === 'Late').length
    const totalEffective = present + absent + late
    if (totalEffective > 0) {
      attPercentage = Math.round(((present + (late * 0.5)) / totalEffective) * 100)
    }
  }
  
  
  const gradeRecords = gradesStore.getGradesForStudent(user.value.id)
  let averageGrade = 0
  if (gradeRecords.length > 0) {
    const totalScores = gradeRecords.map(r => (r.midterm||0) + (r.final||0) + (r.assignments||0))
    averageGrade = Math.round(totalScores.reduce((a, b) => a + b, 0) / totalScores.length)
  }
  
  return { attPercentage, averageGrade, courses: gradeRecords.length }
})

const adminStats = computed(() => {
  if (user.value?.role !== 'admin') return null
  return {
    totalUsers: usersStore.users.length,
    totalBooks: libraryStore.inventory.length
  }
})

const financeStats = computed(() => {
  if (user.value?.role !== 'finance') return null
  return {
    pendingFees: financeStore.feeRecords.filter(f => f.status === 'pending').length,
    pendingSalaries: financeStore.salaryRecords.filter(s => s.status === 'pending').length
  }
})

const librarianStats = computed(() => {
  if (user.value?.role !== 'librarian') return null
  return {
    totalBooks: libraryStore.inventory.length,
    pendingRequests: libraryStore.requests.filter(r => r.status === 'pending').length
  }
})

const teacherStats = computed(() => {
  if (user.value?.role !== 'teacher' && user.value?.role !== 'hod') return null
  return {
    totalStudents: usersStore.getUsersByRole('student').length
  }
})
</script>

<template>
  <div class="flex flex-col gap-8 pb-8">
    
    
    <transition enter-active-class="transition duration-500 ease-out" enter-from-class="transform translate-y-2 opacity-0" enter-to-class="transform translate-y-0 opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="transform translate-y-0 opacity-100" leave-to-class="transform translate-y-2 opacity-0">
      <div v-if="showToast" class="fixed bottom-10 right-10 z-[100] bg-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700">
        <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
        </div>
        <div>
          <div class="text-xs text-slate-400 font-bold uppercase tracking-widest">Login Successful</div>
          <div class="font-medium text-sm">Welcome to Nexus Uni, {{ user?.name }}!</div>
        </div>
      </div>
    </transition>
    
    
    <div class="glass-panel p-8 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between border-l-4 border-l-accent relative overflow-hidden bg-gradient-to-r from-white/90 to-white/40 shadow-xl shadow-slate-200/50">
      <div class="absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full blur-3xl pointer-events-none"></div>
      
      <div class="relative z-10">
        <h1 class="text-3xl font-extrabold text-slate-800 tracking-tight mb-1">Welcome back, <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">{{ user?.name }}</span></h1>
        <p class="text-slate-500 font-medium capitalize">Here is your {{ user?.role }} overview for today.</p>
      </div>
      
      <div class="mt-6 sm:mt-0 relative z-10">
        <button class="px-6 py-2.5 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 transition-all">Quick Action</button>
      </div>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <NoticeBoard :readOnly="user?.role === 'student'" />
      </div>
      
      <div class="glass-panel p-6 rounded-3xl h-full flex flex-col bg-gradient-to-b from-white/80 to-white/30 backdrop-blur-md shadow-xl shadow-slate-200/50">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold text-slate-800">Quick Stats</h3>
          <span class="p-2 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
          </span>
        </div>
        <div class="flex-1 flex flex-col gap-4">
          <div v-if="user?.role === 'student'" class="flex flex-col gap-4">
            <div class="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div>
                <span class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Attendance</span>
                <span class="text-2xl font-black text-slate-800">{{ studentStats.attPercentage }}%</span>
              </div>
              <div class="w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold text-sm" :class="studentStats.attPercentage >= 75 ? 'border-success text-success' : 'border-danger text-danger'">
                {{ studentStats.attPercentage >= 75 ? 'Good' : 'Low' }}
              </div>
            </div>
            
            <div class="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div>
                <span class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Average Grade</span>
                <span class="text-2xl font-black text-slate-800">{{ studentStats.averageGrade }}<span class="text-sm text-slate-400 font-bold">/100</span></span>
              </div>
              <div class="w-12 h-12 rounded-xl bg-slate-800 text-white flex items-center justify-center shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              </div>
            </div>
          </div>
          
          <div v-else-if="user?.role === 'admin'" class="flex flex-col gap-4">
            <div class="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div>
                <span class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Users</span>
                <span class="text-2xl font-black text-slate-800">{{ adminStats.totalUsers }}</span>
              </div>
            </div>
            <div class="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div>
                <span class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Library Books</span>
                <span class="text-2xl font-black text-slate-800">{{ adminStats.totalBooks }}</span>
              </div>
            </div>
          </div>

          <div v-else-if="user?.role === 'finance'" class="flex flex-col gap-4">
            <div class="bg-gradient-to-r from-warning/10 to-danger/10 border border-warning/20 rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div>
                <span class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Pending Fees</span>
                <span class="text-2xl font-black text-slate-800">{{ financeStats.pendingFees }}</span>
              </div>
            </div>
            <div class="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div>
                <span class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Pending Salaries</span>
                <span class="text-2xl font-black text-slate-800">{{ financeStats.pendingSalaries }}</span>
              </div>
            </div>
          </div>

          <div v-else-if="user?.role === 'librarian'" class="flex flex-col gap-4">
            <div class="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div>
                <span class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Books</span>
                <span class="text-2xl font-black text-slate-800">{{ librarianStats.totalBooks }}</span>
              </div>
            </div>
            <div class="bg-gradient-to-r from-warning/10 to-danger/10 border border-warning/20 rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div>
                <span class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Pending Requests</span>
                <span class="text-2xl font-black text-slate-800">{{ librarianStats.pendingRequests }}</span>
              </div>
            </div>
          </div>

          <div v-else-if="user?.role === 'teacher' || user?.role === 'hod'" class="flex flex-col gap-4">
            <div class="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div>
                <span class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Students</span>
                <span class="text-2xl font-black text-slate-800">{{ teacherStats.totalStudents }}</span>
              </div>
            </div>
          </div>
          
          <div v-else class="flex-1 flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border border-dashed border-primary/20 text-slate-500 p-6 text-center">
            <p class="text-sm font-semibold leading-relaxed">Dynamic widgets for <span class="text-primary">{{ user?.role }}</span> will populate here.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
