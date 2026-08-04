<script setup>
import { useFinanceStore } from '../../store/finance'
import { useHrStore } from '../../store/hr'
import { useAuthStore } from '../../store/auth'
import { computed, ref, nextTick, onMounted } from 'vue'

const authStore = useAuthStore()
const financeStore = useFinanceStore()
const hrStore = useHrStore()
const studentId = computed(() => authStore.user?.id)

onMounted(() => {
  financeStore.fetchFinance()
  hrStore.fetchFines()
})

const printingVoucherId = ref(null)

const myVouchers = computed(() => {
  const fees = financeStore.getStudentVouchers(studentId.value)
  const fines = hrStore.getFinesForUser(studentId.value).map(f => ({
    id: f.id,
    type: `Fine: ${f.reason}`,
    amount: f.amount,
    status: f.status,
    dueDate: f.date, 
    generatedDate: f.date,
    isFine: true
  }))
  return [...fees, ...fines]
})

const printingVoucher = ref(null)

const printVoucher = async (voucher) => {
  printingVoucher.value = voucher
  await nextTick()
  window.print()
  printingVoucher.value = null
}
</script>

<template>
  <div class="flex flex-col h-full gap-8 relative">
    
    <div :class="{'print:hidden': printingVoucher}" class="glass-panel p-8 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between border-l-4 border-l-primary relative overflow-hidden">
      <div class="relative z-10">
        <h2 class="text-2xl font-bold text-slate-800 tracking-tight">Fee Vouchers & Fines</h2>
        <p class="text-slate-500 font-medium mt-1">View and print your outstanding university dues and penalties.</p>
      </div>
    </div>

    <div :class="{'print:hidden': printingVoucher}" class="glass-panel p-8 rounded-3xl flex-1 bg-white/50 border border-white/60">
      <div v-if="myVouchers.length === 0" class="flex flex-col items-center justify-center py-16 text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-4 opacity-50"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="M7 15h0"></path><path d="M2 9.5h20"></path></svg>
        <p class="text-lg font-semibold">No fee vouchers found.</p>
        <p class="text-sm">You have no outstanding dues or fines.</p>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div v-for="voucher in myVouchers" :key="voucher.id" :class="[
          voucher.status === 'Paid' ? 'border-emerald-200' : 'border-rose-200'
        ]" class="p-6 rounded-2xl border bg-white shadow-sm flex flex-col gap-4 relative overflow-hidden">
          <div class="flex justify-between items-start mb-2">
            <div>
              <span class="text-xs font-bold uppercase tracking-widest text-slate-400">
                {{ voucher.isFine ? 'Penalty #' : 'Voucher #' }}{{ voucher.id }}
              </span>
              <h3 class="text-lg font-bold text-slate-800 leading-tight mt-1">{{ voucher.type }}</h3>
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-bold print:hidden" :class="voucher.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'">
              {{ voucher.status }}
            </span>
          </div>
          
          <div class="text-3xl font-black text-slate-800">${{ voucher.amount.toLocaleString() }}</div>
          
          <div class="text-sm text-slate-500">
            <div class="flex justify-between">
              <span>Generated:</span>
              <span class="font-medium text-slate-700">{{ voucher.generatedDate }}</span>
            </div>
            <div class="flex justify-between mt-1">
              <span>Due Date:</span>
              <span class="font-medium" :class="voucher.status === 'Unpaid' ? 'text-rose-600' : 'text-slate-700'">{{ voucher.dueDate }}</span>
            </div>
          </div>
          
          <div class="mt-auto pt-4 border-t border-slate-100">
            <button @click="printVoucher(voucher)" class="w-full py-2.5 bg-gradient-to-r from-slate-700 to-slate-900 text-white font-bold rounded-xl shadow-lg shadow-slate-900/30 hover:shadow-slate-900/50 hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Print Document
            </button>
          </div>
        </div>
      </div>
    </div>

    
    <div v-if="printingVoucher" class="hidden print:block fixed inset-0 bg-white z-[9999] p-10 font-sans text-slate-800">
      <div class="border-2 border-slate-800 p-8 rounded-xl max-w-4xl mx-auto mt-10">
        <div class="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8">
          <div>
            <h1 class="text-4xl font-black uppercase tracking-tighter">Nexus University</h1>
            <p class="text-lg font-medium text-slate-500 mt-1">Official {{ printingVoucher.isFine ? 'Penalty Notice' : 'Fee Voucher' }}</p>
          </div>
          <div class="text-right">
            <p class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">{{ printingVoucher.isFine ? 'Penalty ID' : 'Voucher ID' }}</p>
            <p class="text-2xl font-black">#{{ printingVoucher.id }}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-12 mb-10">
          <div>
            <p class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Student Details</p>
            <p class="text-xl font-bold">{{ authStore.user?.name }}</p>
            <p class="text-slate-600 font-medium">ID: {{ authStore.user?.id }}</p>
            <p class="text-slate-600 font-medium">Batch: {{ authStore.user?.batch }}</p>
          </div>
          <div class="text-right">
            <p class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Payment Details</p>
            <p class="text-slate-600 font-medium"><span class="font-bold">Due Date:</span> {{ printingVoucher.dueDate }}</p>
            <p class="text-slate-600 font-medium"><span class="font-bold">Status:</span> {{ printingVoucher.status }}</p>
          </div>
        </div>

        <table class="w-full text-left mb-12">
          <thead>
            <tr class="border-y-2 border-slate-800">
              <th class="py-4 font-bold text-slate-800 uppercase tracking-widest text-sm">Description</th>
              <th class="py-4 font-bold text-slate-800 uppercase tracking-widest text-sm text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-slate-200">
              <td class="py-4 font-medium text-lg">{{ printingVoucher.type }}</td>
              <td class="py-4 font-black text-xl text-right">${{ printingVoucher.amount.toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>

        <div class="flex justify-between items-end border-t-2 border-slate-800 pt-6">
          <div class="text-slate-500 text-sm italic">
            * This is an electronically generated document.
          </div>
          <div class="text-right">
            <p class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Total Payable</p>
            <p class="text-4xl font-black">${{ printingVoucher.amount.toLocaleString() }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
