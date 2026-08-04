<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  user: {
    type: Object,
    default: null
  }
})
const emit = defineEmits(['close', 'save'])

const formData = ref({
  name: '',
  username: '',
  password: '',
  role: 'student',
  salary: 0,
  fee_status: 'Unpaid'
})

watch(() => props.user, (newVal) => {
  if (newVal) {
    formData.value = { ...newVal }
    if (newVal.feeStatus) formData.value.fee_status = newVal.feeStatus;
  } else {
    formData.value = { name: '', username: '', password: '', role: 'student', salary: 0, fee_status: 'Unpaid' }
  }
}, { immediate: true })

const save = () => {
  const emitData = { ...formData.value }
  if (!emitData.id) {
    emitData.id = emitData.username
  }
  delete emitData.username
  emit('save', emitData)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4" @click.self="$emit('close')">
      <div class="w-full max-w-lg bg-surface p-8 rounded-2xl shadow-xl border border-white/20">
        <h4 class="text-xl font-bold text-slate-800 mb-6">{{ user ? 'Edit User' : 'Create New User' }}</h4>
        <form @submit.prevent="save" class="flex flex-col gap-4">
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block mb-1 text-sm font-medium text-slate-500">Full Name</label>
              <input type="text" v-model="formData.name" class="form-input" required />
            </div>
            <div>
              <label class="block mb-1 text-sm font-medium text-slate-500">Role</label>
              <select v-model="formData.role" class="form-input" required>
                <option value="admin">Admin</option>
                <option value="hod">HOD</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
                <option value="finance">Finance</option>
                <option value="hr">HR</option>
                <option value="librarian">Librarian</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block mb-1 text-sm font-medium text-slate-500">Username</label>
              <input type="text" v-model="formData.username" class="form-input" required />
            </div>
            <div>
              <label class="block mb-1 text-sm font-medium text-slate-500">Password</label>
              <input type="password" v-model="formData.password" class="form-input" required />
            </div>
          </div>

          
          <div v-if="formData.role === 'student'" class="p-4 bg-slate-50 rounded-xl border border-slate-200 mt-2">
            <label class="block mb-1 text-sm font-medium text-slate-500">Fee Status</label>
            <select v-model="formData.fee_status" class="form-input">
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>
          
          <div v-else-if="['teacher', 'hod', 'admin', 'finance', 'hr', 'librarian'].includes(formData.role)" class="p-4 bg-slate-50 rounded-xl border border-slate-200 mt-2">
            <label class="block mb-1 text-sm font-medium text-slate-500">Monthly Salary ($)</label>
            <input type="number" v-model="formData.salary" class="form-input" min="0" />
          </div>

          <div class="flex justify-end gap-4 mt-6">
            <button type="button" @click="$emit('close')" class="btn-secondary">Cancel</button>
            <button type="submit" class="px-6 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-md font-medium hover:opacity-90 transition-all shadow-sm">Save User</button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
