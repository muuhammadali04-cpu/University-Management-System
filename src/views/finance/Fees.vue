<script setup>
import { useFinanceStore } from '../../store/finance'
import { useUsersStore } from '../../store/users'
import { useInfrastructureStore } from '../../store/infrastructure'
import { computed, ref, nextTick } from 'vue'

const financeStore = useFinanceStore()
const usersStore = useUsersStore()
const infraStore = useInfrastructureStore()

const allVouchers = computed(() => financeStore.getAllVouchers)
const students = computed(() => usersStore.getUsersByRole('student'))


const batches = computed(() => {
  const uniqueBatches = new Set(students.value.map(s => s.batch).filter(Boolean))
  return Array.from(uniqueBatches).sort()
})

const activeBatch = ref(batches.value[0] || 'Fall 2023')

onMounted(() => {
  financeStore.fetchFinanceData()
})

const filteredVouchers = computed(() => {
  const batchStudentIds = students.value.filter(s => s.batch === activeBatch.value).map(s => s.id)
  return allVouchers.value.filter(v => batchStudentIds.includes(v.student_id))
})

const getStudentName = (studentId) => {
  return students.value.find(s => s.id === studentId)?.name || 'Unknown'
}

const printingVoucher = ref(null)

const printVoucher = async (voucher) => {
  printingVoucher.value = voucher
  await nextTick()
  window.print()
  printingVoucher.value = null
}

const markPaid = (id) => financeStore.payVoucher(id)
const markUnpaid = (id) => financeStore.markUnpaid(id)
</script>

<template>
  <div class="flex flex-col h-full gap-8 relative">
    <div :class="{'print:hidden': printingVoucher}" class="glass-panel p-8 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between border-l-4 border-l-primary relative overflow-hidden">
      <div class="relative z-10">
        <h2 class="text-2xl font-bold text-slate-800 tracking-tight">Fee Management</h2>
        <p class="text-slate-500 font-medium mt-1">Manage, collect, and print fee vouchers by batch.</p>
      </div>
    </div>

    
    <div class="flex items-center gap-4 print:hidden">
      <label class="font-bold text-slate-700 text-sm">Select Batch:</label>
      <select v-model="activeBatch" class="form-input w-48 shadow-sm">
        <option v-for="batch in batches" :key="batch" :value="batch">{{ batch }}</option>
      </select>
    </div>

    <div :class="{'print:hidden': printingVoucher}" class="glass-panel p-6 rounded-3xl flex-1 bg-white/50 border border-white/60 overflow-hidden flex flex-col">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">
              <th class="p-4">Voucher ID</th>
              <th class="p-4">Student</th>
              <th class="p-4">Type</th>
              <th class="p-4">Amount</th>
              <th class="p-4">Due Date</th>
              <th class="p-4">Status</th>
              <th class="p-4 print:hidden">Actions</th>
            </tr>
          </thead>
          <tbody class="text-sm font-medium text-slate-600">
            <tr v-if="filteredVouchers.length === 0">
              <td colspan="7" class="p-8 text-center text-slate-400 font-semibold">No vouchers found for this batch.</td>
            </tr>
            <tr v-for="voucher in filteredVouchers" :key="voucher.id" class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
              <td class="p-4 text-slate-400 font-bold">#{{ voucher.id }}</td>
              <td class="p-4 font-bold text-slate-800">
                <div class="flex flex-col">
                  <span>{{ getStudentName(voucher.student_id) }}</span>
                  <span class="text-xs font-medium text-slate-400">{{ voucher.student_id }}</span>
                </div>
              </td>
              <td class="p-4">{{ voucher.type }}</td>
              <td class="p-4 font-black text-primary">${{ voucher.amount.toLocaleString() }}</td>
              <td class="p-4">{{ voucher.due_date }}</td>
              <td class="p-4">
                <span class="px-3 py-1 rounded-full text-xs font-bold" :class="voucher.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'">
                  {{ voucher.status }}
                </span>
              </td>
              <td class="p-4 print:hidden flex gap-2">
                <button v-if="voucher.status === 'Unpaid'" @click="markPaid(voucher.id)" class="px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-md font-bold text-xs transition-colors">
                  Mark Paid
                </button>
                <button v-if="voucher.status === 'Paid'" @click="markUnpaid(voucher.id)" class="px-3 py-1.5 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-md font-bold text-xs transition-colors">
                  Mark Unpaid
                </button>
                <button @click="printVoucher(voucher)" class="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md font-bold text-xs transition-colors">
                  Print
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    
    <div v-if="printingVoucher" class="hidden print:block fixed inset-0 bg-white z-[9999] p-10 font-sans text-slate-800">
      <div class="border-2 border-slate-800 p-8 rounded-xl max-w-4xl mx-auto mt-10">
        <div class="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8">
          <div>
            <h1 class="text-4xl font-black uppercase tracking-tighter">Nexus University</h1>
            <p class="text-lg font-medium text-slate-500 mt-1">Official Fee Voucher</p>
          </div>
          <div class="text-right">
            <p class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Voucher ID</p>
            <p class="text-2xl font-black">#{{ printingVoucher.id }}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-12 mb-10">
          <div>
            <p class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Student Details</p>
            <p class="text-xl font-bold">{{ getStudentName(printingVoucher.student_id) }}</p>
            <p class="text-slate-600 font-medium">ID: {{ printingVoucher.student_id }}</p>
            <p class="text-slate-600 font-medium">Batch: {{ activeBatch }}</p>
          </div>
          <div class="text-right">
            <p class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Payment Details</p>
            <p class="text-slate-600 font-medium"><span class="font-bold">Due Date:</span> {{ printingVoucher.due_date }}</p>
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
