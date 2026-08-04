<script setup>
import { useHrStore } from '../../store/hr'
import { useUsersStore } from '../../store/users'
import { useInfrastructureStore } from '../../store/infrastructure'
import { computed, ref, onMounted } from 'vue'

const hrStore = useHrStore()

onMounted(() => {
  hrStore.fetchFines()
})
const usersStore = useUsersStore()
const infraStore = useInfrastructureStore()

const allFines = computed(() => hrStore.getAllFines)
const students = computed(() => usersStore.getUsersByRole('student'))
const teachers = computed(() => usersStore.getUsersByRole('teacher'))

const activeTab = ref('student') 


const studentBatches = computed(() => {
  const uniqueBatches = new Set(infraStore.sections.map(s => s.semester).filter(Boolean))
  return Array.from(uniqueBatches)
})
const activeBatch = ref(studentBatches.value[0] || 'Fall 2023')

const filteredFines = computed(() => {
  if (activeTab.value === 'student') {
    const batchStudentIds = students.value.filter(s => s.batch === activeBatch.value).map(s => s.id)
    return allFines.value.filter(f => batchStudentIds.includes(f.user_id))
  } else {
    const teacherIds = teachers.value.map(t => t.id)
    return allFines.value.filter(f => teacherIds.includes(f.user_id))
  }
})

const getUserName = (userId) => {
  const user = usersStore.users.find(u => u.id === userId)
  return user ? user.name : 'Unknown'
}

const isModalOpen = ref(false)
const isEditing = ref(false)
const newFine = ref({ id: null, userId: '', amount: 0, reason: '' })

const openIssueModal = () => {
  isEditing.value = false
  newFine.value = { id: null, userId: '', amount: 0, reason: '' }
  isModalOpen.value = true
}

const openEditModal = (fine) => {
  isEditing.value = true
  newFine.value = { ...fine }
  isModalOpen.value = true
}

const saveFine = () => {
  if (newFine.value.userId && newFine.value.amount > 0 && newFine.value.reason) {
    if (isEditing.value) {
      hrStore.modifyFine(newFine.value.id, newFine.value.amount, newFine.value.reason)
    } else {
      hrStore.issueFine(newFine.value.userId, newFine.value.amount, newFine.value.reason)
    }
    isModalOpen.value = false
  }
}
</script>

<template>
  <div class="flex flex-col h-full gap-8 relative">
    <div class="glass-panel p-8 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between border-l-4 border-l-danger relative overflow-hidden">
      <div class="relative z-10">
        <h2 class="text-2xl font-bold text-slate-800 tracking-tight">Fines & Penalties</h2>
        <p class="text-slate-500 font-medium mt-1">Manage and issue disciplinary or administrative fines.</p>
      </div>
      <div class="mt-6 sm:mt-0 relative z-10">
        <button @click="openIssueModal" class="px-6 py-2.5 bg-danger hover:bg-danger-dark text-white font-bold rounded-xl shadow-lg shadow-danger/30 hover:-translate-y-0.5 transition-all">
          Issue Fine
        </button>
      </div>
    </div>

    
    <div class="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
      <button 
        @click="activeTab = 'student'"
        class="px-6 py-2.5 rounded-lg font-bold text-sm transition-all"
        :class="activeTab === 'student' ? 'bg-white text-danger shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'"
      >
        Student Fines
      </button>
      <button 
        @click="activeTab = 'teacher'"
        class="px-6 py-2.5 rounded-lg font-bold text-sm transition-all"
        :class="activeTab === 'teacher' ? 'bg-white text-danger shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'"
      >
        Teacher Fines
      </button>
    </div>

    
    <div v-if="activeTab === 'student'" class="flex items-center gap-4">
      <label class="font-bold text-slate-700 text-sm">Select Batch:</label>
      <select v-model="activeBatch" class="form-input w-48 shadow-sm py-2 px-3 text-sm">
        <option v-for="batch in studentBatches" :key="batch" :value="batch">{{ batch }}</option>
      </select>
    </div>

    <div class="glass-panel p-6 rounded-3xl flex-1 bg-white/50 border border-white/60 overflow-hidden flex flex-col">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">
              <th class="p-4">ID</th>
              <th class="p-4">User</th>
              <th class="p-4">Reason</th>
              <th class="p-4">Amount</th>
              <th class="p-4">Date Issued</th>
              <th class="p-4">Status</th>
              <th class="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="text-sm font-medium text-slate-600">
            <tr v-if="filteredFines.length === 0">
              <td colspan="7" class="p-8 text-center text-slate-400 font-semibold">No fines found.</td>
            </tr>
            <tr v-for="fine in filteredFines" :key="fine.id" class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
              <td class="p-4 text-slate-400">#{{ fine.id }}</td>
              <td class="p-4 font-bold text-slate-800">
                <div class="flex flex-col">
                  <span>{{ getUserName(fine.user_id) }}</span>
                  <span class="text-xs font-medium text-slate-400">{{ fine.user_id }}</span>
                </div>
              </td>
              <td class="p-4">{{ fine.reason }}</td>
              <td class="p-4 font-bold text-danger">${{ fine.amount.toLocaleString() }}</td>
              <td class="p-4">{{ fine.date }}</td>
              <td class="p-4">
                <span class="px-3 py-1 rounded-full text-xs font-bold" :class="fine.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'">
                  {{ fine.status }}
                </span>
              </td>
              <td class="p-4 text-right">
                <button v-if="fine.status === 'Unpaid'" @click="openEditModal(fine)" class="text-slate-400 hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    
    <Teleport to="body">
      <div v-if="isModalOpen" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4" @click.self="isModalOpen = false">
        <div class="w-full max-w-lg bg-surface p-8 rounded-2xl shadow-xl border border-white/20">
          <h4 class="text-xl font-bold text-slate-800 mb-6">{{ isEditing ? 'Modify Fine' : 'Issue New Fine' }}</h4>
          <form @submit.prevent="saveFine" class="flex flex-col gap-5">
            <div>
              <label class="block mb-2 text-sm font-medium text-slate-500">Select User</label>
              <select v-model="newFine.userId" class="form-input" required :disabled="isEditing">
                <option disabled value="">Select a user...</option>
                <optgroup label="Students">
                  <option v-for="student in students" :key="student.id" :value="student.id">
                    {{ student.name }} ({{ student.id }})
                  </option>
                </optgroup>
                <optgroup label="Teachers">
                  <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">
                    {{ teacher.name }} ({{ teacher.id }})
                  </option>
                </optgroup>
              </select>
            </div>
            <div>
              <label class="block mb-2 text-sm font-medium text-slate-500">Reason</label>
              <input type="text" v-model="newFine.reason" placeholder="e.g. Late Library Return" class="form-input" required />
            </div>
            <div>
              <label class="block mb-2 text-sm font-medium text-slate-500">Amount ($)</label>
              <input type="number" v-model.number="newFine.amount" min="1" class="form-input" required />
            </div>
            
            <div class="flex justify-end gap-4 mt-4">
              <button type="button" @click="isModalOpen = false" class="btn-secondary">Cancel</button>
              <button type="submit" class="px-6 py-2 bg-danger text-white rounded-md font-medium hover:bg-danger-dark transition-colors shadow-sm">
                {{ isEditing ? 'Save Changes' : 'Issue Fine' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>
