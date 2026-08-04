<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'info', 
  },
  message: {
    type: String,
    required: true
  }
})

const alertStyles = computed(() => {
  switch (props.type) {
    case 'success': return { border: 'border-secondary', iconBg: 'bg-secondary', icon: '✓' }
    case 'warning': return { border: 'border-accent', iconBg: 'bg-accent', icon: '!' }
    case 'error': return { border: 'border-red-500', iconBg: 'bg-red-500', icon: '✗' }
    default: return { border: 'border-blue-500', iconBg: 'bg-blue-500', icon: 'i' }
  }
})
</script>

<template>
  <div class="flex items-center p-4 rounded-lg bg-surface border-l-4 shadow-sm animate-[slideIn_0.3s_ease]" :class="alertStyles.border">
    <div class="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs mr-4 shrink-0" :class="alertStyles.iconBg">
      {{ alertStyles.icon }}
    </div>
    <div class="text-sm font-medium text-slate-800">
      {{ message }}
    </div>
  </div>
</template>

<style scoped>
@keyframes slideIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
