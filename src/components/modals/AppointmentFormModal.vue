<script setup>
import { ref } from 'vue'
import { useUsersStore } from '../../store/users'
import { useInfrastructureStore } from '../../store/infrastructure'

const props = defineProps({
  isOpen: Boolean
})
const emit = defineEmits(['close', 'save'])

const usersStore = useUsersStore()
const infraStore = useInfrastructureStore()

const formData = ref({
  teacherId: '',
  subjectId: '',
  roomId: '',
  sectionId: ''
})

const save = () => {
  emit('save', { ...formData.value })
  formData.value = { teacherId: '', subjectId: '', roomId: '', sectionId: '' }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4" @click.self="$emit('close')">
      <div class="w-full max-w-lg bg-surface p-8 rounded-2xl shadow-xl border border-white/20">
        <h4 class="text-xl font-bold text-slate-800 mb-6">Assign Teacher</h4>
        
        <form @submit.prevent="save" class="flex flex-col gap-4">
          <div>
            <label class="block mb-1 text-sm font-medium text-slate-500">Select Teacher</label>
            <select v-model="formData.teacherId" class="form-input" required>
              <option value="" disabled>Choose a teacher...</option>
              <option v-for="t in usersStore.getUsersByRole('teacher')" :key="t.id" :value="t.id">
                {{ t.name }}
              </option>
            </select>
          </div>
          
          <div>
            <label class="block mb-1 text-sm font-medium text-slate-500">Select Subject</label>
            <select v-model="formData.subjectId" class="form-input" required>
              <option value="" disabled>Choose a subject...</option>
              <option v-for="s in infraStore.subjects" :key="s.id" :value="s.id">
                {{ s.code }} - {{ s.name }}
              </option>
            </select>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block mb-1 text-sm font-medium text-slate-500">Select Room</label>
              <select v-model="formData.roomId" class="form-input" required>
                <option value="" disabled>Choose...</option>
                <option v-for="r in infraStore.rooms" :key="r.id" :value="r.id">
                  {{ r.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block mb-1 text-sm font-medium text-slate-500">Select Section</label>
              <select v-model="formData.sectionId" class="form-input" required>
                <option value="" disabled>Choose...</option>
                <option v-for="s in infraStore.sections" :key="s.id" :value="s.id">
                  {{ s.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="flex justify-end gap-4 mt-6">
            <button type="button" @click="$emit('close')" class="btn-secondary">Cancel</button>
            <button type="submit" class="px-6 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-md font-medium hover:opacity-90 transition-all shadow-sm">Assign</button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
