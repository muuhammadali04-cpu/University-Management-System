<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  type: String, 
  item: Object
})
const emit = defineEmits(['close', 'save'])

const formData = ref({})

watch(() => props.item, (newVal) => {
  if (newVal) formData.value = { ...newVal }
  else {
    if (props.type === 'room') formData.value = { name: '', capacity: 30, type: 'Lecture Hall' }
    else if (props.type === 'section') formData.value = { name: '', semester: '', program: '' }
    else if (props.type === 'subject') formData.value = { name: '', code: '', credits: 3 }
  }
}, { immediate: true })

const save = () => emit('save', { ...formData.value })
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4" @click.self="$emit('close')">
      <div class="w-full max-w-md bg-surface p-8 rounded-2xl shadow-xl border border-white/20">
        <h4 class="text-xl font-bold text-slate-800 mb-6 capitalize">{{ item ? 'Edit' : 'Add' }} {{ type }}</h4>
        
        <form @submit.prevent="save" class="flex flex-col gap-4">
          
          <template v-if="type === 'room'">
            <div>
              <label class="block mb-1 text-sm font-medium text-slate-500">Room Name</label>
              <input type="text" v-model="formData.name" class="form-input" required />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block mb-1 text-sm font-medium text-slate-500">Capacity</label>
                <input type="number" v-model="formData.capacity" class="form-input" required />
              </div>
              <div>
                <label class="block mb-1 text-sm font-medium text-slate-500">Type</label>
                <select v-model="formData.type" class="form-input" required>
                  <option value="Lecture Hall">Lecture Hall</option>
                  <option value="Laboratory">Laboratory</option>
                  <option value="Auditorium">Auditorium</option>
                </select>
              </div>
            </div>
          </template>

          
          <template v-if="type === 'section'">
            <div>
              <label class="block mb-1 text-sm font-medium text-slate-500">Section Name</label>
              <input type="text" v-model="formData.name" class="form-input" placeholder="e.g. CS-A" required />
            </div>
            <div>
              <label class="block mb-1 text-sm font-medium text-slate-500">Semester</label>
              <input type="text" v-model="formData.semester" class="form-input" placeholder="e.g. Fall 2023" required />
            </div>
            <div>
              <label class="block mb-1 text-sm font-medium text-slate-500">Program</label>
              <input type="text" v-model="formData.program" class="form-input" required />
            </div>
          </template>

          
          <template v-if="type === 'subject'">
            <div>
              <label class="block mb-1 text-sm font-medium text-slate-500">Subject Name</label>
              <input type="text" v-model="formData.name" class="form-input" required />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block mb-1 text-sm font-medium text-slate-500">Code</label>
                <input type="text" v-model="formData.code" class="form-input" required />
              </div>
              <div>
                <label class="block mb-1 text-sm font-medium text-slate-500">Credits</label>
                <input type="number" v-model="formData.credits" class="form-input" required />
              </div>
            </div>
          </template>

          <div class="flex justify-end gap-4 mt-6">
            <button type="button" @click="$emit('close')" class="btn-secondary">Cancel</button>
            <button type="submit" class="px-6 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-md font-medium hover:opacity-90 transition-all shadow-sm">Save</button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
