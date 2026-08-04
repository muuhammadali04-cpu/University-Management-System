import { defineStore } from 'pinia'
import { ApiClient } from '../services/apiClient'
import { useNotificationStore } from './notifications'

export const useLibraryStore = defineStore('library', {
  state: () => ({
    inventory: [],
    requests: [],
    issuedBooks: [],
    isLoading: false
  }),
  getters: {
    getAllBooks: (state) => state.inventory,
    getAvailableBooks: (state) => state.inventory.filter(b => b.availableCopies > 0),
    getPendingBorrowRequests: (state) => state.requests.filter(r => r.type === 'borrow' && r.status === 'pending'),
    getPendingNewBookRequests: (state) => state.requests.filter(r => r.type === 'new_book' && r.status === 'pending'),
    getUserIssuedBooks: (state) => (userId) => {
      const issued = state.issuedBooks.filter(ib => (ib.userId === userId || ib.user_id === userId) && ib.status === 'issued')
      return issued.map(ib => {
        const book = state.inventory.find(b => b.id === ib.bookId || b.id === ib.book_id)
        return { ...ib, book }
      })
    },
    getUserRequests: (state) => (userId) => {
      return state.requests.filter(r => r.userId === userId || r.user_id === userId)
    }
  },
  actions: {
    async fetchLibraryData() {
      this.isLoading = true
      const books = await ApiClient.get('library_inventory')
      const reqs = await ApiClient.get('library_requests')
      const issued = await ApiClient.get('library_issued')
      
      if (books) this.inventory = books
      if (reqs) this.requests = reqs
      if (issued) this.issuedBooks = issued
      this.isLoading = false
    },
    async addBook(bookData) {
      const dbPayload = {
        title: bookData.title,
        author: bookData.author,
        isbn: bookData.isbn || '',
        category: bookData.category || '',
        total_copies: bookData.totalCopies,
        available_copies: bookData.totalCopies
      }
      const res = await ApiClient.post('library_inventory', dbPayload)
      if (res && res.success) {
        this.inventory.push({ ...res.data, totalCopies: res.data.total_copies, availableCopies: res.data.available_copies })
      }
    },
    async updateBook(id, updatedData) {
      const dbPayload = {}
      if (updatedData.title !== undefined) dbPayload.title = updatedData.title
      if (updatedData.author !== undefined) dbPayload.author = updatedData.author
      if (updatedData.category !== undefined) dbPayload.category = updatedData.category
      if (updatedData.isbn !== undefined) dbPayload.isbn = updatedData.isbn
      if (updatedData.totalCopies !== undefined) dbPayload.total_copies = updatedData.totalCopies
      if (updatedData.availableCopies !== undefined) dbPayload.available_copies = updatedData.availableCopies

      const res = await ApiClient.put('library_inventory', id, dbPayload)
      if (res && res.success) {
        const index = this.inventory.findIndex(b => b.id === id)
        if (index !== -1) {
          this.inventory[index] = { ...this.inventory[index], ...updatedData }
        }
      }
    },
    async deleteBook(id) {
      const res = await ApiClient.delete('library_inventory', id)
      if (res && res.success) {
        this.inventory = this.inventory.filter(b => b.id !== id)
      }
    },
    async requestBorrow(userId, userName, bookId) {
      const newReq = {
        user_id: userId,
        user_name: userName,
        type: 'borrow',
        book_id: bookId,
        status: 'pending'
      }
      const res = await ApiClient.post('library_requests', newReq)
      if (res && res.success) {
        this.requests.push(res.data || newReq)
        const book = this.inventory.find(b => b.id === bookId)
        const notifications = useNotificationStore()
        notifications.addNotification('Alert', `${userName} has requested to borrow "${book?.title}".`, 'librarian')
      }
    },
    async requestNewBook(userId, userName, title, author, reason) {
      const newReq = {
        user_id: userId,
        user_name: userName,
        type: 'new_book',
        title,
        author,
        reason,
        status: 'pending'
      }
      const res = await ApiClient.post('library_requests', newReq)
      if (res && res.success) {
        this.requests.push(res.data || newReq)
        const notifications = useNotificationStore()
        notifications.addNotification('System', `${userName} has suggested a new book: "${title}".`, 'librarian')
      }
    },
    async approveRequest(requestId) {
      const req = this.requests.find(r => r.id === requestId)
      if (!req) return

      const notifications = useNotificationStore()

      if (req.type === 'borrow') {
        const book = this.inventory.find(b => b.id === req.bookId || b.id === req.book_id)
        const available = book.availableCopies !== undefined ? book.availableCopies : book.available_copies
        if (book && available > 0) {
          const updatedBook = { available_copies: available - 1 }
          await ApiClient.put('library_inventory', book.id, updatedBook)
          if (book.availableCopies !== undefined) {
            book.availableCopies--
          } else {
            book.available_copies--
          }
          
          await ApiClient.put('library_requests', req.id, { status: 'approved' })
          req.status = 'approved'

          const issueDate = new Date()
          const dueDate = new Date()
          dueDate.setDate(dueDate.getDate() + 30)

          const newIssue = {
            user_id: req.user_id || req.userId,
            book_id: book.id,
            return_date: dueDate.toISOString().split('T')[0]
          }
          const issueRes = await ApiClient.post('library_issued', newIssue)
          if (issueRes && issueRes.success) {
            this.issuedBooks.push(issueRes.data || newIssue)
          }

          notifications.addNotification(
            'Success',
            `Your request to borrow "${book.title}" has been approved!`,
            null,
            'Just now',
            req.user_id || req.userId
          )
        }
      } else if (req.type === 'new_book') {
        await ApiClient.put('library_requests', req.id, { status: 'approved' })
        req.status = 'approved'
        notifications.addNotification(
          'Success',
          `Your request to order "${req.title}" has been approved.`,
          null,
          'Just now',
          req.user_id || req.userId
        )
      }
    },
    async rejectRequest(requestId, reason = 'Not available at this time.') {
      const req = this.requests.find(r => r.id === requestId)
      if (!req) return
      
      await ApiClient.put('library_requests', req.id, { status: 'rejected' })
      req.status = 'rejected'
      
      const notifications = useNotificationStore()
      let message = req.type === 'borrow' ? `Your request was rejected. Reason: ${reason}` : `Your order request was rejected. Reason: ${reason}`
      notifications.addNotification('Alert', message, null, 'Just now', req.user_id || req.userId)
    },
    async deleteRequest(requestId) {
      const res = await ApiClient.delete('library_requests', requestId)
      if (res && res.success) {
        this.requests = this.requests.filter(r => r.id !== requestId)
      }
    },
    async returnBook(issueId) {
      const issueRecord = this.issuedBooks.find(ib => ib.id === issueId)
      if (issueRecord) {
        await ApiClient.delete('library_issued', issueId)
        
        const book = this.inventory.find(b => b.id === issueRecord.book_id || b.id === issueRecord.bookId)
        if (book) {
          const available = book.availableCopies !== undefined ? book.availableCopies : book.available_copies
          const updatedBook = { available_copies: available + 1 }
          await ApiClient.put('library_inventory', book.id, updatedBook)
          if (book.availableCopies !== undefined) {
            book.availableCopies++
          } else {
            book.available_copies++
          }
        }
        
        this.issuedBooks = this.issuedBooks.filter(ib => ib.id !== issueId)
      }
    }
  }
})
