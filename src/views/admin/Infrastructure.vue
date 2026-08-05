<script setup>
import { ref, onMounted } from 'vue'
import { useInfrastructureStore } from '../../store/infrastructure'
import InfrastructureFormModal from '../../components/modals/InfrastructureFormModal.vue'

const props = defineProps({
  readOnly: {
    type: Boolean,
    default: false
  }
})

const infraStore = useInfrastructureStore()

onMounted(() => {
  infraStore.fetchInfrastructure()
})

const isModalOpen = ref(false)
const modalType = ref('room') 
const editingItem = ref(null)

const openModal = (type, item = null) => {
  modalType.value = type
  editingItem.value = item
  isModalOpen.value = true
}

const handleSave = async (data) => {
  try {
    if (data.id) {
      if (modalType.value === 'room') await infraStore.updateRoom(data.id, data)
      else if (modalType.value === 'section') await infraStore.updateSection(data.id, data)
      else await infraStore.updateSubject(data.id, data)
    } else {
      if (modalType.value === 'room') await infraStore.addRoom(data)
      else if (modalType.value === 'section') await infraStore.addSection(data)
      else await infraStore.addSubject(data)
    }
    isModalOpen.value = false
  } catch (e) {
    alert('Could not save: ' + e.message)
  }
}

const handleDelete = async (type, id) => {
  if (confirm(`Are you sure you want to delete this ${type}?`)) {
    try {
      if (type === 'room') await infraStore.deleteRoom(id)
      else if (type === 'section') await infraStore.deleteSection(id)
      else await infraStore.deleteSubject(id)
    } catch (e) {
      alert('Could not delete: ' + e.message)
    }
  }
}
</script>

<template>
  <div class="pb-8 pt-2">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      
      <div class="glass-panel p-6 rounded-2xl flex flex-col h-[500px]">
        <div class="flex justify-between items-center mb-6">
          <h3 class="font-bold text-slate-800">Rooms</h3>
          <button v-if="!readOnly" @click="openModal('room')" class="text-xs font-semibold text-primary hover:text-primary-dark">+ Add Room</button>
        </div>
        <div class="flex-1 overflow-y-auto pr-2 space-y-3">
          <div v-for="r in infraStore.rooms" :key="r.id" class="p-4 border border-slate-100 bg-white/50 rounded-xl hover:bg-slate-50 transition-colors group">
            <div class="flex justify-between items-start mb-1">
              <h4 class="font-bold text-slate-800">{{ r.name }}</h4>
              <div v-if="!readOnly" class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button @click="openModal('room', r)" class="text-xs px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 rounded-lg font-bold transition-all">Edit</button>
                <button @click="handleDelete('room', r.id)" class="text-xs px-3 py-1.5 bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/30 hover:shadow-rose-500/50 hover:-translate-y-0.5 rounded-lg font-bold transition-all">Del</button>
              </div>
            </div>
            <p class="text-xs text-slate-500">{{ r.type }} &bull; Cap: {{ r.capacity }}</p>
          </div>
        </div>
      </div>

      
      <div class="glass-panel p-6 rounded-2xl flex flex-col h-[500px]">
        <div class="flex justify-between items-center mb-6">
          <h3 class="font-bold text-slate-800">Sections</h3>
          <button v-if="!readOnly" @click="openModal('section')" class="text-xs font-semibold text-primary hover:text-primary-dark">+ Add Section</button>
        </div>
        <div class="flex-1 overflow-y-auto pr-2 space-y-3">
          <div v-for="s in infraStore.sections" :key="s.id" class="p-4 border border-slate-100 bg-white/50 rounded-xl hover:bg-slate-50 transition-colors group">
            <div class="flex justify-between items-start mb-1">
              <h4 class="font-bold text-slate-800">{{ s.name }}</h4>
              <div v-if="!readOnly" class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button @click="openModal('section', s)" class="text-xs px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 rounded-lg font-bold transition-all">Edit</button>
                <button @click="handleDelete('section', s.id)" class="text-xs px-3 py-1.5 bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/30 hover:shadow-rose-500/50 hover:-translate-y-0.5 rounded-lg font-bold transition-all">Del</button>
              </div>
            </div>
            <p class="text-xs text-slate-500">{{ s.program }} &bull; {{ s.semester }}</p>
          </div>
        </div>
      </div>

      
      <div class="glass-panel p-6 rounded-2xl flex flex-col h-[500px]">
        <div class="flex justify-between items-center mb-6">
          <h3 class="font-bold text-slate-800">Subjects</h3>
          <button v-if="!readOnly" @click="openModal('subject')" class="text-xs font-semibold text-primary hover:text-primary-dark">+ Add Subject</button>
        </div>
        <div class="flex-1 overflow-y-auto pr-2 space-y-3">
          <div v-for="sub in infraStore.subjects" :key="sub.id" class="p-4 border border-slate-100 bg-white/50 rounded-xl hover:bg-slate-50 transition-colors group">
            <div class="flex justify-between items-start mb-1">
              <h4 class="font-bold text-slate-800">{{ sub.name }}</h4>
              <div v-if="!readOnly" class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button @click="openModal('subject', sub)" class="text-xs px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 rounded-lg font-bold transition-all">Edit</button>
                <button @click="handleDelete('subject', sub.id)" class="text-xs px-3 py-1.5 bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/30 hover:shadow-rose-500/50 hover:-translate-y-0.5 rounded-lg font-bold transition-all">Del</button>
              </div>
            </div>
            <p class="text-xs text-slate-500">{{ sub.code }} &bull; {{ sub.credits }} Credits</p>
          </div>
        </div>
      </div>

    </div>

    <InfrastructureFormModal 
      v-if="!readOnly"
      :isOpen="isModalOpen"
      :type="modalType"
      :item="editingItem"
      @close="isModalOpen = false"
      @save="handleSave"
    />
  </div>
</template>
