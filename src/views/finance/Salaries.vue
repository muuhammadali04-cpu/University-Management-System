<script setup>
import { useFinanceStore } from '../../store/finance'
import { computed, ref, onMounted } from 'vue'

const financeStore = useFinanceStore()
const payrolls = computed(() => financeStore.payrolls)

onMounted(() => {
  financeStore.fetchFinanceData()
})

const isModalOpen = ref(false)
const newPayroll = ref({ month: '', total_amount: 0 })

const generatePayroll = () => {
  if (newPayroll.value.month && newPayroll.value.total_amount > 0) {
    financeStore.processPayroll(newPayroll.value.month, newPayroll.value.total_amount)
    isModalOpen.value = false
    newPayroll.value = { month: '', total_amount: 0 }
  }
}
</script>

<template>
  <div class="flex flex-col h-full gap-8 relative">
    <div class="glass-panel p-8 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between border-l-4 border-l-accent relative overflow-hidden">
      <div class="relative z-10">
        <h2 class="text-2xl font-bold text-slate-800 tracking-tight">Salaries & Payroll</h2>
        <p class="text-slate-500 font-medium mt-1">Process monthly salaries for all university staff.</p>
      </div>
      <div class="mt-6 sm:mt-0 relative z-10">
        <button @click="isModalOpen = true" class="px-6 py-2.5 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 transition-all">
          Run Payroll
        </button>
      </div>
    </div>

    <div class="glass-panel p-6 rounded-3xl flex-1 bg-white/50 border border-white/60 overflow-hidden flex flex-col">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">
              <th class="p-4">Payroll ID</th>
              <th class="p-4">Month</th>
              <th class="p-4">Total Amount Disbursed</th>
              <th class="p-4">Status</th>
            </tr>
          </thead>
          <tbody class="text-sm font-medium text-slate-600">
            <tr v-for="run in payrolls" :key="run.id" class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
              <td class="p-4 text-slate-400">#{{ run.id }}</td>
              <td class="p-4 font-bold text-slate-800">{{ run.month }}</td>
              <td class="p-4 font-bold text-primary">${{ run.total_amount.toLocaleString() }}</td>
              <td class="p-4">
                <span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                  {{ run.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    
    <Teleport to="body">
      <div v-if="isModalOpen" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4" @click.self="isModalOpen = false">
        <div class="w-full max-w-lg bg-surface p-8 rounded-2xl shadow-xl border border-white/20">
          <h4 class="text-xl font-bold text-slate-800 mb-6">Run Monthly Payroll</h4>
          <form @submit.prevent="generatePayroll" class="flex flex-col gap-5">
            <div>
              <label class="block mb-2 text-sm font-medium text-slate-500">Payroll Month</label>
              <select v-model="newPayroll.month" class="form-input" required>
                <option disabled value="">Select month...</option>
                <option v-for="m in ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']" :key="m" :value="m">
                  {{ m }}
                </option>
              </select>
            </div>
            <div>
              <label class="block mb-2 text-sm font-medium text-slate-500">Estimated Total Amount ($)</label>
              <input type="number" v-model.number="newPayroll.total_amount" min="1000" class="form-input" required />
            </div>
            <div class="p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm text-primary font-medium mt-2">
              Note: Processing payroll will automatically generate salary slips for all active employees and update HR ledgers.
            </div>
            <div class="flex justify-end gap-4 mt-4">
              <button type="button" @click="isModalOpen = false" class="btn-secondary">Cancel</button>
              <button type="submit" class="px-6 py-2 bg-primary text-white rounded-md font-medium hover:bg-primary-light transition-colors shadow-sm">Execute</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>
