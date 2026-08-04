<script setup>
import { ref, onMounted } from 'vue'
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'

const isSidebarOpen = ref(true)

onMounted(() => {
  if (window.innerWidth < 768) {
    isSidebarOpen.value = false
  }
})
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-transparent print:h-auto print:overflow-visible">
    <div v-if="isSidebarOpen" @click="isSidebarOpen = false" class="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm"></div>
    <AppSidebar :isOpen="isSidebarOpen" @toggle="isSidebarOpen = !isSidebarOpen" />
    <div class="flex-1 flex flex-col overflow-hidden print:overflow-visible min-w-0">
      <AppHeader @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />
      <main class="flex-1 overflow-y-auto p-4 md:p-8 print:overflow-visible print:p-0">
        <router-view />
      </main>
    </div>
  </div>
</template>
