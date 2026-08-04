<script setup>
import { ref } from 'vue'
import { useAppointmentsStore } from '../../store/appointments'
import { useUsersStore } from '../../store/users'
import { useInfrastructureStore } from '../../store/infrastructure'
import AppointmentFormModal from '../../components/modals/AppointmentFormModal.vue'

const appStore = useAppointmentsStore()
const userStore = useUsersStore()
const infraStore = useInfrastructureStore()

const isModalOpen = ref(false)

const getTeacherName = (id) => userStore.users.find(u => u.id === id)?.name || 'Unknown'
const getSubjectName = (id) => infraStore.subjects.find(s => s.id === id)?.name || 'Unknown'
const getRoomName = (id) => infraStore.rooms.find(r => r.id === id)?.name || 'Unknown'
const getSectionName = (id) => infraStore.sections.find(s => s.id === id)?.name || 'Unknown'

const handleSave = (data) => {
  appStore.addAppointment(data)
  isModalOpen.value = false
}
</script>

<template>
  <div class="flex flex-col h-full pb-8 pt-2">
    <div class="glass-panel overflow-hidden flex-1 flex flex-col">
      <div class="p-5 border-b border-slate-100 flex justify-between items-center bg-white/30">
        <h3 class="font-bold text-slate-800">Assignments Directory</h3>
        <button @click="isModalOpen = true" class="btn-primary-sm shadow-primary/20 shadow-lg">+ New Assignment</button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/50 border-b border-slate-100">
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Teacher</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Room</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Section</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100/50">
            <tr v-if="appStore.appointments.length === 0">
              <td colspan="5" class="px-6 py-10 text-center text-slate-500 text-sm">No assignments made yet.</td>
            </tr>
            <tr v-for="app in appStore.appointments" :key="app.id" class="hover:bg-slate-50/50 transition-colors">
              <td class="px-6 py-4 text-sm font-bold text-slate-800">{{ getTeacherName(app.teacherId) }}</td>
              <td class="px-6 py-4 text-sm text-slate-600">{{ getSubjectName(app.subjectId) }}</td>
              <td class="px-6 py-4 text-sm text-slate-600">{{ getRoomName(app.roomId) }}</td>
              <td class="px-6 py-4 text-sm text-slate-600">{{ getSectionName(app.sectionId) }}</td>
              <td class="px-6 py-4 text-sm text-right">
                <button @click="appStore.deleteAppointment(app.id)" class="px-4 py-2 bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 hover:-translate-y-0.5 rounded-lg font-bold transition-all">Revoke</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <AppointmentFormModal 
      :isOpen="isModalOpen" 
      @close="isModalOpen = false"
      @save="handleSave"
    />
  </div>
</template>
