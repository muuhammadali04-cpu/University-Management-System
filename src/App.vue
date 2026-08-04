<script setup>
import { ref, onMounted } from 'vue'
import { ApiClient } from './services/apiClient'

const isConnected = ref(null)

onMounted(async () => {
  isConnected.value = await ApiClient.checkConnection()
})
</script>

<template>
  <div v-if="isConnected !== null" class="fixed bottom-4 right-4 z-[9999] text-xs py-2 px-4 rounded-full text-white font-bold shadow-lg transition-all duration-300 flex items-center gap-2 cursor-default hover:scale-105" :class="isConnected ? 'bg-emerald-500 shadow-emerald-500/40' : 'bg-rose-500 shadow-rose-500/40'">
    <div class="w-2 h-2 rounded-full bg-white" :class="isConnected ? 'animate-pulse' : ''"></div>
    <span v-if="isConnected">Live Connection</span>
    <span v-else>Database Offline</span>
  </div>
  <router-view />
</template>
