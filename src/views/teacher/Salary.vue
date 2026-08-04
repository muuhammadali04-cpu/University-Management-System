<script setup>
import { useFinanceStore } from '../../store/finance'
import { useAuthStore } from '../../store/auth'
import { computed, ref, nextTick } from 'vue'

const authStore = useAuthStore()
const financeStore = useFinanceStore()
const teacherId = computed(() => authStore.user?.id)

const salarySlips = computed(() => financeStore.getTeacherSalarySlips(teacherId.value))

const printingSlip = ref(null)

const printCertificate = async (slip = null) => {
  if (slip) {
    printingSlip.value = slip
    await nextTick()
  }
  window.print()
  printingSlip.value = null
}
</script>

<template>
  <div class="flex flex-col h-full gap-8 relative">
    <div :class="{'print:hidden': printingSlip}" class="glass-panel p-8 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between border-l-4 border-l-primary relative overflow-hidden">
      <div class="relative z-10">
        <h2 class="text-2xl font-bold text-slate-800 tracking-tight">My Salary</h2>
        <p class="text-slate-500 font-medium mt-1">View your monthly salary slips and payroll history.</p>
      </div>
      <div class="mt-6 sm:mt-0 relative z-10 print:hidden">
        <button @click="printCertificate(null)" class="px-6 py-2.5 bg-gradient-to-r from-slate-700 to-slate-900 text-white font-bold rounded-xl shadow-lg shadow-slate-900/30 hover:shadow-slate-900/50 hover:-translate-y-0.5 transition-all flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          Print All Slips
        </button>
      </div>
    </div>

    <div :class="{'print:hidden': printingSlip}" class="glass-panel p-8 rounded-3xl flex-1 bg-white/50 border border-white/60">
      <div v-if="salarySlips.length === 0" class="flex flex-col items-center justify-center py-16 text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-4 opacity-50"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        <p class="text-lg font-semibold">No salary slips generated yet.</p>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div v-for="slip in salarySlips" :key="slip.id" class="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all group flex flex-col">
          <div class="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
            <div>
              <span class="text-xs font-bold uppercase tracking-widest text-slate-400">Payroll Month</span>
              <h3 class="text-xl font-black text-primary">{{ slip.month }}</h3>
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 print:hidden">
              {{ slip.status }}
            </span>
          </div>
          
          <div class="space-y-3">
            <div class="flex justify-between items-center text-slate-600 font-medium">
              <span>Base Salary</span>
              <span>${{ slip.base.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between items-center text-slate-600 font-medium">
              <span>Allowances</span>
              <span class="text-emerald-600">+${{ slip.allowances.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between items-center text-slate-600 font-medium">
              <span>Deductions (Leaves/Fines)</span>
              <span class="text-rose-600">-${{ slip.deductions.toLocaleString() }}</span>
            </div>
            
            <div class="pt-4 mt-2 border-t border-slate-100 flex justify-between items-center">
              <span class="text-sm font-bold uppercase tracking-widest text-slate-400">Net Pay</span>
              <span class="text-2xl font-black text-slate-800">${{ slip.netPay.toLocaleString() }}</span>
            </div>
            <div class="mt-6 pt-4 border-t border-slate-100 print:hidden">
              <button @click="printCertificate(slip)" class="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all flex justify-center items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                Print Slip
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    
    <div v-if="printingSlip" class="hidden print:block fixed inset-0 bg-white z-[9999] p-10 font-sans text-slate-800">
      <div class="border-2 border-slate-800 p-8 rounded-xl max-w-4xl mx-auto mt-10">
        <div class="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8">
          <div>
            <h1 class="text-4xl font-black uppercase tracking-tighter">Nexus University</h1>
            <p class="text-lg font-medium text-slate-500 mt-1">Official Salary Slip / Tax Certificate</p>
          </div>
          <div class="text-right">
            <p class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Slip ID</p>
            <p class="text-2xl font-black">#{{ printingSlip.id }}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-12 mb-10">
          <div>
            <p class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Employee Details</p>
            <p class="text-xl font-bold">{{ authStore.user?.name }}</p>
            <p class="text-slate-600 font-medium">ID: {{ authStore.user?.id }}</p>
            <p class="text-slate-600 font-medium">Role: Faculty</p>
          </div>
          <div class="text-right">
            <p class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Payroll Details</p>
            <p class="text-slate-600 font-medium"><span class="font-bold">Month:</span> {{ printingSlip.month }}</p>
            <p class="text-slate-600 font-medium"><span class="font-bold">Status:</span> {{ printingSlip.status }}</p>
          </div>
        </div>

        <table class="w-full text-left mb-12">
          <thead>
            <tr class="border-y-2 border-slate-800">
              <th class="py-4 font-bold text-slate-800 uppercase tracking-widest text-sm">Earnings & Deductions</th>
              <th class="py-4 font-bold text-slate-800 uppercase tracking-widest text-sm text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-slate-200">
              <td class="py-4 font-medium text-lg text-slate-600">Base Salary</td>
              <td class="py-4 font-bold text-lg text-right">${{ printingSlip.base.toLocaleString() }}</td>
            </tr>
            <tr class="border-b border-slate-200">
              <td class="py-4 font-medium text-lg text-slate-600">Allowances</td>
              <td class="py-4 font-bold text-lg text-right text-emerald-600">+${{ printingSlip.allowances.toLocaleString() }}</td>
            </tr>
            <tr class="border-b border-slate-200">
              <td class="py-4 font-medium text-lg text-slate-600">Deductions (Leaves/Fines)</td>
              <td class="py-4 font-bold text-lg text-right text-rose-600">-${{ printingSlip.deductions.toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>

        <div class="flex justify-between items-end border-t-2 border-slate-800 pt-6">
          <div class="text-slate-500 text-sm italic">
            * This document serves as proof of income and tax deductions.
          </div>
          <div class="text-right">
            <p class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Net Pay</p>
            <p class="text-4xl font-black">${{ printingSlip.netPay.toLocaleString() }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
