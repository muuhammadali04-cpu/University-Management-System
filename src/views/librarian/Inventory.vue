<script setup>
import { useLibraryStore } from '../../store/library'
import { computed, ref, onMounted } from 'vue'

const libraryStore = useLibraryStore()
const inventory = computed(() => libraryStore.getAllBooks)

onMounted(() => {
  libraryStore.fetchLibraryData()
})

const showAddModal = ref(false)
const showEditModal = ref(false)

const newBook = ref({
  title: '',
  author: '',
  isbn: '',
  category: '',
  totalCopies: 1
})

const editingBook = ref(null)

const openAddModal = () => {
  newBook.value = {
    title: '',
    author: '',
    isbn: '',
    category: '',
    totalCopies: 1
  }
  showAddModal.value = true
}

const handleAddBook = () => {
  if (newBook.value.title && newBook.value.author) {
    libraryStore.addBook({ ...newBook.value })
    showAddModal.value = false
  }
}

const openEditModal = (book) => {
  editingBook.value = { ...book }
  showEditModal.value = true
}

const handleUpdateBook = () => {
  if (editingBook.value.title && editingBook.value.author) {
    libraryStore.updateBook(editingBook.value.id, { ...editingBook.value })
    showEditModal.value = false
  }
}

const handleDeleteBook = (id) => {
  if (confirm('Are you sure you want to remove this book from the library?')) {
    libraryStore.deleteBook(id)
  }
}
</script>

<template>
  <div class="flex flex-col h-full gap-8 relative">
    
    <div class="glass-panel p-8 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between border-l-4 border-l-primary relative overflow-hidden shrink-0">
      <div class="relative z-10">
        <h2 class="text-2xl font-bold text-slate-800 tracking-tight">Library Inventory</h2>
        <p class="text-slate-500 font-medium mt-1">Manage books, track copies, and update catalog.</p>
      </div>
      <div class="mt-6 sm:mt-0 relative z-10">
        <button @click="openAddModal" class="px-6 py-2.5 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 transition-all flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add New Book
        </button>
      </div>
    </div>

    
    <div class="glass-panel p-8 rounded-3xl flex-1 bg-white/50 border border-white/60">
      <div v-if="inventory.length === 0" class="flex flex-col items-center justify-center py-16 text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-4 opacity-50"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
        <p class="text-lg font-semibold">Inventory is empty.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b-2 border-slate-200">
              <th class="py-4 px-4 font-bold text-slate-800 uppercase tracking-widest text-sm">Book Title</th>
              <th class="py-4 px-4 font-bold text-slate-800 uppercase tracking-widest text-sm">Author</th>
              <th class="py-4 px-4 font-bold text-slate-800 uppercase tracking-widest text-sm">Category</th>
              <th class="py-4 px-4 font-bold text-slate-800 uppercase tracking-widest text-sm">Copies</th>
              <th class="py-4 px-4 font-bold text-slate-800 uppercase tracking-widest text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="book in inventory" :key="book.id" class="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
              <td class="py-4 px-4">
                <div class="font-bold text-slate-800 text-lg">{{ book.title }}</div>
                <div class="text-sm font-medium text-slate-500">ISBN: {{ book.isbn }}</div>
              </td>
              <td class="py-4 px-4 font-medium text-slate-600">{{ book.author }}</td>
              <td class="py-4 px-4">
                <span class="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                  {{ book.category }}
                </span>
              </td>
              <td class="py-4 px-4">
                <div class="flex items-center gap-2">
                  <span class="font-black text-lg" :class="book.availableCopies === 0 ? 'text-rose-600' : 'text-emerald-600'">
                    {{ book.availableCopies }}
                  </span>
                  <span class="text-slate-500 font-medium">/ {{ book.totalCopies }}</span>
                </div>
                <div v-if="book.availableCopies === 0" class="text-xs font-bold text-rose-500 mt-1 uppercase tracking-widest">
                  Out of Stock
                </div>
              </td>
              <td class="py-4 px-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button @click="openEditModal(book)" class="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                  </button>
                  <button @click="handleDeleteBook(book.id)" class="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    
    <div v-if="showAddModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-accent"></div>
        <h3 class="text-2xl font-black text-slate-800 mb-6">Add New Book</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Title</label>
            <input v-model="newBook.title" type="text" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium" placeholder="Book Title">
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Author</label>
            <input v-model="newBook.author" type="text" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium" placeholder="Author Name">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1">ISBN</label>
              <input v-model="newBook.isbn" type="text" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium" placeholder="ISBN">
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1">Total Copies</label>
              <input v-model="newBook.totalCopies" type="number" min="1" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium">
            </div>
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Category</label>
            <input v-model="newBook.category" type="text" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium" placeholder="e.g. Computer Science">
          </div>
        </div>
        <div class="flex gap-3 mt-8">
          <button @click="showAddModal = false" class="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all">Cancel</button>
          <button @click="handleAddBook" class="flex-1 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all">Add Book</button>
        </div>
      </div>
    </div>

    
    <div v-if="showEditModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-accent"></div>
        <h3 class="text-2xl font-black text-slate-800 mb-6">Edit Book</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Title</label>
            <input v-model="editingBook.title" type="text" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium">
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Author</label>
            <input v-model="editingBook.author" type="text" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1">ISBN</label>
              <input v-model="editingBook.isbn" type="text" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium">
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1">Available Copies</label>
              <input v-model="editingBook.availableCopies" type="number" min="0" :max="editingBook.totalCopies" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium">
            </div>
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Category</label>
            <input v-model="editingBook.category" type="text" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium">
          </div>
        </div>
        <div class="flex gap-3 mt-8">
          <button @click="showEditModal = false" class="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all">Cancel</button>
          <button @click="handleUpdateBook" class="flex-1 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all">Save Changes</button>
        </div>
      </div>
    </div>
  </div>
</template>
