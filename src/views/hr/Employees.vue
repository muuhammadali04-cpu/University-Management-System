<script setup>
import { useUsersStore } from '../../store/users'
import { computed } from 'vue'

const usersStore = useUsersStore()

const employees = computed(() => {
  return usersStore.users.filter(u => u.role !== 'student')
})
</script>

<template>
  <div class="flex flex-col h-full gap-8 relative">
    <div class="glass-panel p-8 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between border-l-4 border-l-primary relative overflow-hidden">
      <div class="relative z-10">
        <h2 class="text-2xl font-bold text-slate-800 tracking-tight">Employee Directory</h2>
        <p class="text-slate-500 font-medium mt-1">View staff, roles, and employment status.</p>
      </div>
    </div>

    <div class="glass-panel p-6 rounded-3xl flex-1 bg-white/50 border border-white/60 overflow-hidden flex flex-col">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">
              <th class="p-4">EMP ID</th>
              <th class="p-4">Name</th>
              <th class="p-4">Role</th>
              <th class="p-4">Username</th>
              <th class="p-4">Status</th>
            </tr>
          </thead>
          <tbody class="text-sm font-medium text-slate-600">
            <tr v-for="emp in employees" :key="emp.id" class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
              <td class="p-4 text-slate-400 font-bold">{{ emp.id }}</td>
              <td class="p-4 font-bold text-slate-800">{{ emp.name }}</td>
              <td class="p-4 capitalize">{{ emp.role }}</td>
              <td class="p-4">{{ emp.username }}</td>
              <td class="p-4">
                <span class="px-3 py-1 rounded-full text-xs font-bold" :class="emp.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'">
                  {{ emp.status || 'Active' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
