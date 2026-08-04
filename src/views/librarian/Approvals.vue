<script setup>
import { useLibraryStore } from '../../store/library'
import { computed, ref, onMounted } from 'vue'

const libraryStore = useLibraryStore()

onMounted(() => {
  libraryStore.fetchLibraryData()
})

const activeTab = ref('borrow') 

const borrowRequests = computed(() => libraryStore.getPendingBorrowRequests)
const newBookRequests = computed(() => libraryStore.getPendingNewBookRequests)

const getBookDetails = (bookId) => {
  return libraryStore.inventory.find(b => b.id === bookId)
}

const handleApprove = (id) => {
  if (confirm('Approve this request?')) {
    libraryStore.approveRequest(id)
  }
}

const handleReject = (id) => {
  const reason = prompt('Please provide a reason for rejection:', 'Book currently unavailable.')
  if (reason !== null) {
    libraryStore.rejectRequest(id, reason)
  }
}
</script>

<template>
  <div class="flex flex-col h-full gap-8 relative">
    
    <div class="glass-panel p-8 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between border-l-4 border-l-primary relative overflow-hidden shrink-0">
      <div class="relative z-10">
        <h2 class="text-2xl font-bold text-slate-800 tracking-tight">Library Approvals</h2>
        <p class="text-slate-500 font-medium mt-1">Review pending borrow requests and new book suggestions.</p>
      </div>
    </div>

    <div class="glass-panel p-8 rounded-3xl flex-1 bg-white/50 border border-white/60 flex flex-col">
      
      
      <div class="flex gap-4 mb-8 border-b border-slate-200 pb-4">
        <button 
          @click="activeTab = 'borrow'"
          class="px-6 py-2.5 rounded-xl font-bold transition-all relative overflow-hidden"
          :class="activeTab === 'borrow' ? 'text-primary bg-primary/10' : 'text-slate-500 hover:bg-slate-100'"
        >
          Borrow Requests
          <span v-if="borrowRequests.length > 0" class="ml-2 px-2 py-0.5 rounded-full text-xs bg-rose-500 text-white">{{ borrowRequests.length }}</span>
        </button>
        <button 
          @click="activeTab = 'new_book'"
          class="px-6 py-2.5 rounded-xl font-bold transition-all relative overflow-hidden"
          :class="activeTab === 'new_book' ? 'text-primary bg-primary/10' : 'text-slate-500 hover:bg-slate-100'"
        >
          New Book Orders
          <span v-if="newBookRequests.length > 0" class="ml-2 px-2 py-0.5 rounded-full text-xs bg-rose-500 text-white">{{ newBookRequests.length }}</span>
        </button>
      </div>

      
      <div v-if="activeTab === 'borrow'" class="flex-1">
        <div v-if="borrowRequests.length === 0" class="flex flex-col items-center justify-center py-16 text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-4 opacity-50"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <p class="text-lg font-semibold">No pending borrow requests.</p>
        </div>
        
        <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div v-for="req in borrowRequests" :key="req.id" class="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all group flex flex-col relative overflow-hidden">
            <div class="absolute top-0 right-0 p-4">
              <span class="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full uppercase tracking-widest">Pending</span>
            </div>
            
            <div class="mb-4">
              <span class="text-xs font-bold uppercase tracking-widest text-slate-400">User Details</span>
              <div class="text-lg font-bold text-slate-800 mt-1">{{ req.userName }}</div>
              <div class="text-sm font-medium text-slate-500">ID: {{ req.userId }}</div>
            </div>

            <div class="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-6">
              <span class="text-xs font-bold uppercase tracking-widest text-slate-400">Requested Book</span>
              <div class="font-bold text-primary text-lg mt-1">{{ getBookDetails(req.bookId)?.title }}</div>
              <div class="text-sm font-medium text-slate-600 mb-2">by {{ getBookDetails(req.bookId)?.author }}</div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-slate-500 uppercase tracking-widest">Stock:</span>
                <span class="font-black text-sm" :class="getBookDetails(req.bookId)?.availableCopies === 0 ? 'text-rose-600' : 'text-emerald-600'">
                  {{ getBookDetails(req.bookId)?.availableCopies }} Available
                </span>
              </div>
            </div>

            <div class="flex gap-3 mt-auto">
              <button @click="handleReject(req.id)" class="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                Reject
              </button>
              <button 
                @click="handleApprove(req.id)" 
                :disabled="getBookDetails(req.bookId)?.availableCopies === 0"
                class="flex-1 py-2.5 font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                :class="getBookDetails(req.bookId)?.availableCopies === 0 ? 'bg-slate-200 text-slate-400' : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'"
              >
                Approve & Issue
              </button>
            </div>
          </div>
        </div>
      </div>

      
      <div v-if="activeTab === 'new_book'" class="flex-1">
        <div v-if="newBookRequests.length === 0" class="flex flex-col items-center justify-center py-16 text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-4 opacity-50"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          <p class="text-lg font-semibold">No new book order requests.</p>
        </div>

        <div v-else class="grid grid-cols-1 gap-6">
          <div v-for="req in newBookRequests" :key="req.id" class="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all group flex flex-col relative overflow-hidden">
            <div class="absolute top-0 right-0 p-4">
              <span class="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full uppercase tracking-widest">Pending</span>
            </div>

            <div class="flex flex-col md:flex-row gap-8">
              <div class="w-full md:w-1/3">
                <span class="text-xs font-bold uppercase tracking-widest text-slate-400">Requested By</span>
                <div class="text-lg font-bold text-slate-800 mt-1">{{ req.userName }}</div>
                <div class="text-sm font-medium text-slate-500">ID: {{ req.userId }}</div>
                <div class="text-sm font-medium text-slate-400 mt-1">Date: {{ req.date }}</div>
              </div>

              <div class="w-full md:w-2/3 p-5 bg-slate-50 rounded-xl border border-slate-100">
                <span class="text-xs font-bold uppercase tracking-widest text-slate-400">Book Information</span>
                <div class="font-bold text-slate-800 text-xl mt-1">{{ req.title }}</div>
                <div class="text-md font-medium text-slate-600 mb-4">by {{ req.author }}</div>
                
                <span class="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-1">Reason for Order</span>
                <p class="text-sm text-slate-700 italic border-l-2 border-primary/30 pl-3 py-1">"{{ req.reason }}"</p>
              </div>
            </div>

            <div class="flex gap-3 mt-6 ml-auto">
              <button @click="handleReject(req.id)" class="px-8 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl transition-all">
                Reject
              </button>
              <button @click="handleApprove(req.id)" class="px-8 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all">
                Approve & Order
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
