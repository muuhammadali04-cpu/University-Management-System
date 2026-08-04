<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../../store/auth'
import { useGradesStore } from '../../store/grades'
import { useInfrastructureStore } from '../../store/infrastructure'
import { useUsersStore } from '../../store/users'

const authStore = useAuthStore()
const gradesStore = useGradesStore()
const infraStore = useInfrastructureStore()
const usersStore = useUsersStore()

const studentId = computed(() => authStore.user?.id)

const reportCard = computed(() => {
  if (!studentId.value) return []
  
  const records = gradesStore.getGradesForStudent(studentId.value)
  return records.map(r => ({
    ...r,
    subject: infraStore.subjects.find(s => s.id === r.subjectId),
    teacher: usersStore.users.find(u => u.id === r.teacherId),
    total: (r.midterm || 0) + (r.final || 0) + (r.assignments || 0)
  }))
})

const getGradeLetter = (total) => {
  if (total >= 90) return 'A+'
  if (total >= 85) return 'A'
  if (total >= 80) return 'B+'
  if (total >= 75) return 'B'
  if (total >= 70) return 'C+'
  if (total >= 65) return 'C'
  if (total >= 60) return 'D'
  return 'F'
}

const getGPAForSubject = (total) => {
  if (total >= 90) return 4.0
  if (total >= 85) return 3.7
  if (total >= 80) return 3.3
  if (total >= 75) return 3.0
  if (total >= 70) return 2.7
  if (total >= 65) return 2.3
  if (total >= 60) return 2.0
  return 0.0
}

const cgpa = computed(() => {
  if (reportCard.value.length === 0) return 0.0
  const totalGps = reportCard.value.reduce((acc, grade) => acc + getGPAForSubject(grade.total), 0)
  return (totalGps / reportCard.value.length).toFixed(2)
})
</script>

<template>
  <div class="flex flex-col h-full gap-8">
    
    
    <div class="flex-1 glass-panel rounded-3xl border border-white/60 bg-white/70 backdrop-blur-md shadow-xl overflow-hidden flex flex-col relative">
      <div class="absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div class="flex-1 overflow-y-auto p-8">
        
        
        <div v-if="reportCard.length > 0" class="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <div class="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden flex items-center">
            <div class="absolute -right-10 -bottom-10 w-32 h-32 bg-primary/30 rounded-full blur-2xl"></div>
            <div>
              <p class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Cumulative GPA (CGPA)</p>
              <div class="flex items-baseline gap-2">
                <span class="text-5xl font-black">{{ cgpa }}</span>
                <span class="text-lg font-medium text-slate-400">/ 4.00</span>
              </div>
            </div>
            <div class="ml-auto bg-white/10 p-4 rounded-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </div>
          </div>
          
          <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-around">
            <div class="text-center">
              <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Subjects</p>
              <span class="text-3xl font-black text-slate-700">{{ reportCard.length }}</span>
            </div>
            <div class="w-px h-12 bg-slate-200"></div>
            <div class="text-center">
              <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Credits</p>
              <span class="text-3xl font-black text-slate-700">{{ reportCard.length * 3 }}</span>
            </div>
          </div>
        </div>

        <div v-if="reportCard.length === 0" class="h-full flex flex-col items-center justify-center text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-4 opacity-50"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <p class="font-medium text-lg">No grades published yet</p>
          <p class="text-sm">Your teachers have not uploaded any grades.</p>
        </div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          <div v-for="grade in reportCard" :key="grade.id" class="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col relative overflow-hidden group">
            <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
            </div>
            
            <div class="mb-4">
              <h3 class="font-bold text-slate-800 text-lg leading-tight">{{ grade.subject?.name }}</h3>
              <p class="text-xs font-semibold text-primary mt-1">{{ grade.subject?.code }} • {{ grade.teacher?.name }}</p>
            </div>
            
            <div class="grid grid-cols-3 gap-2 mb-4">
              <div class="bg-slate-50 rounded-lg p-2 text-center border border-slate-100">
                <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Midterm</span>
                <span class="font-bold text-slate-700">{{ grade.midterm }}/30</span>
              </div>
              <div class="bg-slate-50 rounded-lg p-2 text-center border border-slate-100">
                <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Final</span>
                <span class="font-bold text-slate-700">{{ grade.final }}/50</span>
              </div>
              <div class="bg-slate-50 rounded-lg p-2 text-center border border-slate-100">
                <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Asgmts</span>
                <span class="font-bold text-slate-700">{{ grade.assignments }}/20</span>
              </div>
            </div>
            
            <div class="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
              <div>
                <span class="block font-bold text-slate-500 uppercase tracking-widest text-xs mb-1">Total Score</span>
                <span class="text-2xl font-black text-slate-800">{{ grade.total }}<span class="text-sm font-bold text-slate-400">/100</span></span>
              </div>
              <div class="flex items-center gap-3">
                <div class="text-right mr-2">
                  <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">GPA</span>
                  <span class="font-black text-slate-700">{{ getGPAForSubject(grade.total).toFixed(1) }}</span>
                </div>
                <span class="w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-black text-2xl shadow-lg" :class="grade.total >= 50 ? 'from-emerald-500 to-emerald-600 shadow-emerald-500/30' : 'from-rose-500 to-rose-600 shadow-rose-500/30'">
                  {{ getGradeLetter(grade.total) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
