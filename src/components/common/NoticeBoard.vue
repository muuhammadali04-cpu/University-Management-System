<script setup>
import { ref, computed, onMounted } from 'vue'
import { useNoticesStore } from '../../store/notices'
import { useAuthStore } from '../../store/auth'

const props = defineProps({
  readOnly: {
    type: Boolean,
    default: false
  }
})

const noticesStore = useNoticesStore()
const authStore = useAuthStore()

onMounted(() => {
  noticesStore.fetchNotices()
})

const notices = computed(() => noticesStore.notices)

const isModalOpen = ref(false)
const newNotice = ref({ title: '', content: '' })

const submitNotice = async () => {
  if (newNotice.value.title && newNotice.value.content) {
    try {
      await noticesStore.addNotice({
        title: newNotice.value.title,
        author: authStore.user?.name || 'Faculty',
        authorId: authStore.user?.id,
        role: authStore.user?.role,
        content: newNotice.value.content
      })
      isModalOpen.value = false
      newNotice.value = { title: '', content: '' }
    } catch (e) {
      alert('Could not post notice: ' + e.message)
    }
  }
}
</script>

<template>
  <div class="glass-panel p-6 rounded-3xl h-full flex flex-col bg-slate-50/90 shadow-xl shadow-slate-200/50 relative overflow-hidden border border-slate-200/50">
    <div class="absolute -left-20 -bottom-20 w-64 h-64 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl pointer-events-none"></div>
    
    <div class="flex justify-between items-center mb-6 relative z-10">
      <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
        <span class="w-2 h-6 bg-gradient-to-b from-primary to-accent rounded-full inline-block"></span>
        Notice Board
      </h3>
      <button v-if="!readOnly" @click="isModalOpen = true" class="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-lg shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 transition-all text-sm">+ New Notice</button>
    </div>
    
    <div class="flex flex-col gap-4 overflow-y-auto relative z-10 pr-2 pb-2">
      <div v-for="notice in notices" :key="notice.id" class="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/5 group-hover:to-transparent transition-all duration-500 pointer-events-none"></div>
        <div class="relative z-10">
          <div class="flex justify-between text-xs text-slate-500 mb-3">
            <span class="font-bold text-primary">{{ notice.author }}</span>
            <div class="flex items-center gap-2">
              <button v-if="notice.authorId === authStore.user?.id" @click="noticesStore.deleteNotice(notice.id)" class="text-danger hover:text-danger-dark opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-danger/10 hover:bg-danger/20 rounded-md" title="Delete Notice">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
              </button>
              <span class="font-medium bg-slate-100/80 px-2 py-1 rounded-md">{{ notice.date }}</span>
            </div>
          </div>
          <h4 class="font-bold text-slate-800 mb-2 text-base group-hover:text-primary transition-colors">{{ notice.title }}</h4>
          <p class="text-sm text-slate-600 leading-relaxed font-medium">{{ notice.content }}</p>
        </div>
      </div>
    </div>

    
    <Teleport to="body">
      <div v-if="isModalOpen" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4" @click.self="isModalOpen = false">
        <div class="w-full max-w-lg bg-surface p-8 rounded-2xl shadow-xl border border-white/20">
          <h4 class="text-xl font-bold text-slate-800 mb-6">Post New Notice</h4>
          <form @submit.prevent="submitNotice" class="flex flex-col gap-5">
            <div>
              <label class="block mb-2 text-sm font-medium text-slate-500">Title</label>
              <input type="text" v-model="newNotice.title" class="form-input" required />
            </div>
            <div>
              <label class="block mb-2 text-sm font-medium text-slate-500">Content</label>
              <textarea v-model="newNotice.content" class="form-input" rows="4" required></textarea>
            </div>
            <div class="flex justify-end gap-4 mt-4">
              <button type="button" @click="isModalOpen = false" class="btn-secondary">Cancel</button>
              <button type="submit" class="px-6 py-2 bg-primary text-white rounded-md font-medium hover:bg-primary-light transition-colors shadow-sm">Post Notice</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>
