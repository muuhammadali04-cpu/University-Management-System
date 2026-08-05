<script setup>
import { useLibraryStore } from '../../store/library'
import { useAuthStore } from '../../store/auth'
import { computed, ref } from 'vue'

const libraryStore = useLibraryStore()
const authStore = useAuthStore()

const activeTab = ref('browse') 

const availableBooks = computed(() => libraryStore.getAvailableBooks)
const allBooks = computed(() => libraryStore.getAllBooks)
const myIssuedBooks = computed(() => libraryStore.getUserIssuedBooks(authStore.user?.id))
const myRequests = computed(() => libraryStore.getUserRequests(authStore.user?.id))

const searchQuery = ref('')
const filteredBooks = computed(() => {
  let list = activeTab.value === 'browse' ? availableBooks.value : allBooks.value
  if (!searchQuery.value) return list
  return list.filter(b => 
    b.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
    b.author.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    b.category.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const showBorrowModal = ref(false)
const selectedBook = ref(null)
const openBorrowModal = (book) => {
  selectedBook.value = book
  showBorrowModal.value = true
}

const handleBorrowRequest = async () => {
  if (selectedBook.value) {
    try {
      await libraryStore.requestBorrow(authStore.user.id, authStore.user.name, selectedBook.value.id)
      showBorrowModal.value = false
      selectedBook.value = null
      activeTab.value = 'my_books' 
    } catch (e) {
      alert('Could not submit request: ' + e.message)
    }
  }
}

const newBookRequest = ref({
  title: '',
  author: '',
  reason: ''
})

const handleNewBookRequest = async () => {
  if (newBookRequest.value.title && newBookRequest.value.author && newBookRequest.value.reason) {
    try {
      await libraryStore.requestNewBook(
        authStore.user.id, 
        authStore.user.name, 
        newBookRequest.value.title, 
        newBookRequest.value.author, 
        newBookRequest.value.reason
      )
      newBookRequest.value = { title: '', author: '', reason: '' }
      showSuggestModal.value = false
    } catch (e) {
      alert('Could not submit request: ' + e.message)
    }
  }
}

const handleDeleteRequest = (id) => {
  if (confirm('Are you sure you want to cancel/delete this request?')) {
    libraryStore.deleteRequest(id)
  }
}

const showSuggestModal = ref(false)
</script>

<template>
  <div class="flex flex-col h-full gap-8 relative">
    
    <div class="glass-panel p-6 md:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between border-l-4 border-l-primary relative overflow-hidden gap-6 shrink-0">
      <div class="relative z-10 flex-1 min-w-0 pr-4">
        <h2 class="text-2xl font-bold text-slate-800 tracking-tight">University Library</h2>
        <p class="text-slate-500 font-medium mt-1 text-sm md:text-base">Browse catalogs, request books, and manage your borrowed items.</p>
      </div>
      <div class="relative z-10 w-full md:w-80 shrink-0">
        <div class="relative" style="width: 100%;">
          <svg style="position: absolute; left: 1.25rem; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none;" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input v-model="searchQuery" type="text" placeholder="Search books..." class="w-full py-2.5 bg-white/80 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-700 font-medium shadow-sm" style="padding-left: 3rem; padding-right: 1rem;">
        </div>
      </div>
    </div>

    <div class="glass-panel p-8 rounded-3xl flex-1 bg-white/50 border border-white/60 flex flex-col">
      
      
      <div class="flex flex-wrap gap-4 mb-8 border-b border-slate-200 pb-4 justify-between items-center">
        <div class="flex flex-wrap gap-4">
          <button 
            @click="activeTab = 'browse'"
            class="px-6 py-2.5 rounded-xl font-bold transition-all relative overflow-hidden"
            :class="activeTab === 'browse' ? 'text-primary bg-primary/10' : 'text-slate-500 hover:bg-slate-100'"
          >
            Browse Books
          </button>
          <button 
            @click="activeTab = 'my_books'"
            class="px-6 py-2.5 rounded-xl font-bold transition-all relative overflow-hidden"
            :class="activeTab === 'my_books' ? 'text-primary bg-primary/10' : 'text-slate-500 hover:bg-slate-100'"
          >
            My Borrowed Books & Requests
          </button>
        </div>
        <button 
          @click="showSuggestModal = true"
          class="px-5 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl transition-all flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path><line x1="12" y1="5" x2="12" y2="13"></line><line x1="8" y1="9" x2="16" y2="9"></line></svg>
          Suggest New Book
        </button>
      </div>

      
      <div v-if="activeTab === 'browse'" class="flex-1">
        <div v-if="filteredBooks.length === 0" class="flex flex-col items-center justify-center py-16 text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-4 opacity-50"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          <p class="text-lg font-semibold">No books found.</p>
        </div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="book in filteredBooks" :key="book.id" class="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col group">
            <div class="mb-2">
              <span class="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">{{ book.category }}</span>
            </div>
            <h3 class="text-xl font-bold text-slate-800 leading-tight mt-1">{{ book.title }}</h3>
            <p class="text-slate-500 font-medium mt-1">by {{ book.author }}</p>
            
            <div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold uppercase tracking-widest text-slate-400">Available:</span>
                <span class="font-black text-emerald-600">{{ book.availableCopies }}</span>
              </div>
              <button @click="openBorrowModal(book)" class="px-4 py-2 bg-slate-100 group-hover:bg-primary group-hover:text-white text-slate-700 font-bold rounded-lg transition-all text-sm">
                Borrow
              </button>
            </div>
          </div>
        </div>
      </div>

      
      <div v-if="activeTab === 'my_books'" class="flex-1 space-y-12">
        
        <div>
          <h3 class="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-500"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            Currently Borrowed
          </h3>
          <div v-if="myIssuedBooks.length === 0" class="p-8 bg-slate-50 rounded-2xl border border-slate-100 text-center text-slate-500">
            You don't have any issued books.
          </div>
          <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div v-for="issue in myIssuedBooks" :key="issue.id" class="p-6 rounded-2xl border border-emerald-100 bg-emerald-50 shadow-sm flex flex-col relative">
              <span class="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-1">Due Date: {{ issue.dueDate }}</span>
              <h4 class="text-lg font-bold text-slate-800">{{ issue.book.title }}</h4>
              <p class="text-slate-600 font-medium text-sm mt-1">by {{ issue.book.author }}</p>
              <div class="mt-4 pt-4 border-t border-emerald-200/50 flex justify-between items-center text-sm text-emerald-700 font-medium">
                <span>Issued on: {{ issue.issueDate }}</span>
                <span class="px-3 py-1 bg-emerald-200/50 rounded-full font-bold">Issued</span>
              </div>
            </div>
          </div>
        </div>

        
        <div>
          <h3 class="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-amber-500"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            Recent Requests
          </h3>
          <div v-if="myRequests.length === 0" class="p-8 bg-slate-50 rounded-2xl border border-slate-100 text-center text-slate-500">
            You haven't made any requests.
          </div>
          <div v-else class="overflow-hidden border border-slate-200 rounded-2xl bg-white">
            <table class="w-full text-left">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-200">
                  <th class="py-3 px-4 font-bold text-slate-600 uppercase tracking-widest text-xs">Date</th>
                  <th class="py-3 px-4 font-bold text-slate-600 uppercase tracking-widest text-xs">Request Type</th>
                  <th class="py-3 px-4 font-bold text-slate-600 uppercase tracking-widest text-xs">Details</th>
                  <th class="py-3 px-4 font-bold text-slate-600 uppercase tracking-widest text-xs">Status</th>
                  <th class="py-3 px-4 font-bold text-slate-600 uppercase tracking-widest text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="req in myRequests" :key="req.id" class="border-b border-slate-100 last:border-0">
                  <td class="py-3 px-4 text-sm font-medium text-slate-600">{{ req.date }}</td>
                  <td class="py-3 px-4">
                    <span class="px-2 py-1 rounded text-xs font-bold" :class="req.type === 'borrow' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'">
                      {{ req.type === 'borrow' ? 'Borrow Book' : 'Order New Book' }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-sm font-medium text-slate-800">
                    {{ req.type === 'borrow' ? allBooks.find(b => b.id === req.bookId)?.title : req.title }}
                  </td>
                  <td class="py-3 px-4">
                    <span class="px-2 py-1 rounded-full text-xs font-bold" 
                      :class="{
                        'bg-amber-100 text-amber-700': req.status === 'pending',
                        'bg-emerald-100 text-emerald-700': req.status === 'approved',
                        'bg-rose-100 text-rose-700': req.status === 'rejected'
                      }">
                      {{ req.status }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-right">
                    <button v-if="req.status !== 'approved'" @click="handleDeleteRequest(req.id)" class="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors" title="Delete Request">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      </div>

    
    <Teleport to="body">
      <div v-if="showBorrowModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
        <div class="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden text-center">
          <div class="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          </div>
          <h3 class="text-xl font-black text-slate-800 mb-2">Borrow Book</h3>
          <p class="text-slate-500 font-medium mb-6">Are you sure you want to request <span class="font-bold text-slate-700">"{{ selectedBook ? selectedBook.title : '' }}"</span>?</p>
          
          <div class="flex gap-3">
            <button @click="showBorrowModal = false" class="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all">Cancel</button>
            <button @click="handleBorrowRequest" class="flex-1 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all">Confirm</button>
          </div>
        </div>
      </div>
      <div v-if="showSuggestModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
        <div class="bg-white rounded-3xl p-8 max-w-xl w-full shadow-2xl relative overflow-hidden">
          <button @click="showSuggestModal = false" class="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          <div class="text-center mb-8">
            <div class="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path><line x1="12" y1="5" x2="12" y2="13"></line><line x1="8" y1="9" x2="16" y2="9"></line></svg>
            </div>
            <h3 class="text-2xl font-black text-slate-800">Suggest a Book</h3>
            <p class="text-slate-500 font-medium mt-2">If you need a book for a course or research that isn't in our catalog, fill out the details below.</p>
          </div>

          <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div>
              <label class="block text-sm font-bold text-slate-700" style="margin-bottom: 0.5rem;">Book Title</label>
              <input v-model="newBookRequest.title" type="text" class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium shadow-sm" placeholder="Exact title of the book">
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700" style="margin-bottom: 0.5rem;">Author / Publisher</label>
              <input v-model="newBookRequest.author" type="text" class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium shadow-sm" placeholder="Author name(s) or publisher">
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700" style="margin-bottom: 0.5rem;">Reason / Course Requirement</label>
              <textarea v-model="newBookRequest.reason" rows="3" class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium shadow-sm resize-none" placeholder="Briefly explain why this book is needed..."></textarea>
            </div>
            <div class="flex gap-3 pt-2">
              <button @click="showSuggestModal = false" class="w-1/3 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all text-lg">Cancel</button>
              <button @click="handleNewBookRequest" class="flex-1 py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all text-lg">
                Submit Request
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
