<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUsersStore } from '../../store/users'
import UserFormModal from '../../components/modals/UserFormModal.vue'

const usersStore = useUsersStore()

const roles = ['admin', 'hod', 'teacher', 'student', 'finance', 'hr', 'librarian']
const activeTab = ref('student')

const filteredUsers = computed(() => usersStore.getUsersByRole(activeTab.value))

const isModalOpen = ref(false)
const editingUser = ref(null)

onMounted(() => {
  usersStore.fetchUsers()
})

const openAddModal = () => {
  editingUser.value = null
  isModalOpen.value = true
}

const openEditModal = (user) => {
  editingUser.value = user
  isModalOpen.value = true
}

const handleSave = async (userData) => {
  try {
    if (userData.id && usersStore.users.some(u => u.id === userData.id)) {
      await usersStore.updateUser(userData.id, userData)
    } else {
      await usersStore.addUser(userData)
    }
    isModalOpen.value = false
  } catch (e) {
    alert('Could not save user: ' + e.message)
  }
}

const handleDelete = async (id) => {
  if (confirm('Are you sure you want to delete this user?')) {
    try {
      await usersStore.deleteUser(id)
    } catch (e) {
      alert('Could not delete user: ' + e.message)
    }
  }
}
</script>

<template>
  <div class="flex flex-col gap-4 h-full pb-8 pt-2">
    
    <div class="flex justify-between items-end border-b border-slate-200">
      <div class="flex gap-2 overflow-x-auto hide-scrollbar">
        <button 
          v-for="role in roles" 
          :key="role"
          @click="activeTab = role"
          class="px-5 py-3 text-sm font-semibold capitalize whitespace-nowrap transition-colors relative"
          :class="activeTab === role ? 'text-primary' : 'text-slate-500 hover:text-slate-800'"
        >
          {{ role }}s
          <span v-if="activeTab === role" class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></span>
        </button>
      </div>
      <button @click="openAddModal" class="btn-primary-sm shadow-primary/20 shadow-lg shrink-0 mb-2">+ Add New User</button>
    </div>

    
    <div class="glass-panel overflow-hidden flex-1 flex flex-col">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/50 border-b border-slate-100">
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Username</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                {{ activeTab === 'student' ? 'Fee Status' : 'Salary' }}
              </th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100/50">
            <tr v-if="filteredUsers.length === 0">
              <td colspan="5" class="px-6 py-10 text-center text-slate-500 text-sm">No {{ activeTab }}s found.</td>
            </tr>
            <tr v-for="user in filteredUsers" :key="user.id || user.username" class="hover:bg-slate-50/50 transition-colors">
              <td class="px-6 py-4 text-sm font-medium text-slate-500">#{{ user.id ? user.id.toString().slice(-4) : 'NEW' }}</td>
              <td class="px-6 py-4 text-sm font-bold text-slate-800">{{ user.name }}</td>
              <td class="px-6 py-4 text-sm text-slate-500">{{ user.id || user.username }}</td>
              <td class="px-6 py-4 text-sm font-medium">
                <span v-if="activeTab === 'student'" class="px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm" :class="(user.fee_status || user.feeStatus) === 'Paid' ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-rose-500 shadow-rose-500/30'">
                  {{ user.fee_status || user.feeStatus || 'Unpaid' }}
                </span>
                <span v-else class="text-slate-600 font-bold">${{ user.salary || 0 }}/mo</span>
              </td>
              <td class="px-6 py-4 text-sm text-right space-x-3">
                <button @click="openEditModal(user)" class="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 rounded-lg font-bold transition-all">Edit</button>
                <button @click="handleDelete(user.id)" class="px-4 py-2 bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 hover:-translate-y-0.5 rounded-lg font-bold transition-all">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <UserFormModal 
      :isOpen="isModalOpen" 
      :user="editingUser"
      @close="isModalOpen = false"
      @save="handleSave"
    />
  </div>
</template>
