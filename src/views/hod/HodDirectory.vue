<script setup>
import { ref, computed } from 'vue'
import { useUsersStore } from '../../store/users'
import Infrastructure from '../admin/Infrastructure.vue'

const usersStore = useUsersStore()

const roles = ['admin', 'hod', 'teacher', 'student', 'finance', 'hr', 'librarian']
const activeTab = ref('student')

const filteredUsers = computed(() => usersStore.getUsersByRole(activeTab.value))
</script>

<template>
  <div class="flex flex-col gap-4 pb-8 pt-2">
    
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
      
    </div>

    
    <div class="glass-panel overflow-hidden flex flex-col mb-8 min-h-[450px]">
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
              
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100/50">
            <tr v-if="filteredUsers.length === 0">
              <td colspan="4" class="px-6 py-10 text-center text-slate-500 text-sm">No {{ activeTab }}s found.</td>
            </tr>
            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-slate-50/50 transition-colors">
              <td class="px-6 py-4 text-sm font-medium text-slate-500">#{{ user.id.toString().slice(-4) || user.id }}</td>
              <td class="px-6 py-4 text-sm font-bold text-slate-800">{{ user.name }}</td>
              <td class="px-6 py-4 text-sm text-slate-500">{{ user.username }}</td>
              <td class="px-6 py-4 text-sm font-medium">
                <span v-if="activeTab === 'student'" class="px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm" :class="user.feeStatus === 'Paid' ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-rose-500 shadow-rose-500/30'">
                  {{ user.feeStatus || 'Unpaid' }}
                </span>
                <span v-else class="text-slate-600 font-bold">${{ user.salary || 0 }}/mo</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="activeTab === 'infrastructure'" class="flex-1 overflow-y-auto">
      <Infrastructure :readOnly="true" />
    </div>
  </div>
</template>
