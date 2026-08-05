import { defineStore } from 'pinia'
import { ApiClient } from '../services/apiClient'
import { useNotificationStore } from './notifications'

function normalizeRequest(r) {
  if (!r) return r
  return {
    ...r,
    userId: r.user_id ?? r.userId,
    bookId: r.book_id ?? r.bookId,
    user_id: r.user_id ?? r.userId,
    book_id: r.book_id ?? r.bookId
  }
}

function normalizeIssued(ib) {
  if (!ib) return ib
  return {
    ...ib,
    userId: ib.user_id ?? ib.userId,
    bookId: ib.book_id ?? ib.bookId,
    user_id: ib.user_id ?? ib.userId,
    book_id: ib.book_id ?? ib.bookId
  }
}

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
      // library_issued has no status column - a row existing IS the
      // "currently issued" state (returnBook deletes the row). Filtering
      // on a non-existent status field previously hid every issued book.
      const issued = state.issuedBooks.filter(ib => ib.userId === userId || ib.user_id === userId)
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
      
      if (books) {
        this.inventory = books.map(b => ({
          ...b,
          totalCopies: b.totalcopies ?? b.totalCopies,
          availableCopies: b.availablecopies ?? b.availableCopies
        }))
      }
      if (reqs) this.requests = reqs.map(normalizeRequest)
      if (issued) this.issuedBooks = issued.map(normalizeIssued)
      this.isLoading = false
    },
    async addBook(bookData) {
      // library_inventory.id is a TEXT PRIMARY KEY with no default - it
      // must be supplied by the client. It was never being generated
      // before, which made every "Add Book" fail.
      const id = bookData.id || 'BOOK-' + Date.now().toString(36).toUpperCase()

      // The schema declares `totalCopies`/`availableCopies` unquoted, so
      // Postgres folds them to lowercase: totalcopies / availablecopies.
      // Sending total_copies/available_copies (snake_case) doesn't match
      // any real column and was silently breaking every insert.
      const dbPayload = {
        id,
        title: bookData.title,
        author: bookData.author,
        isbn: bookData.isbn || '',
        category: bookData.category || '',
        totalcopies: bookData.totalCopies,
        availablecopies: bookData.totalCopies
      }
      const res = await ApiClient.post('library_inventory', dbPayload)
      if (res && res.success) {
        this.inventory.push({
          ...res.data,
          totalCopies: res.data.totalcopies,
          availableCopies: res.data.availablecopies
        })
      } else {
        console.error('Failed to add book', res?.error)
        throw new Error(res?.error?.message || 'Failed to add book')
      }
    },
    async updateBook(id, updatedData) {
      const dbPayload = {}
      if (updatedData.title !== undefined) dbPayload.title = updatedData.title
      if (updatedData.author !== undefined) dbPayload.author = updatedData.author
      if (updatedData.category !== undefined) dbPayload.category = updatedData.category
      if (updatedData.isbn !== undefined) dbPayload.isbn = updatedData.isbn
      if (updatedData.totalCopies !== undefined) dbPayload.totalcopies = updatedData.totalCopies
      if (updatedData.availableCopies !== undefined) dbPayload.availablecopies = updatedData.availableCopies

      const res = await ApiClient.put('library_inventory', id, dbPayload)
      if (res && res.success) {
        const index = this.inventory.findIndex(b => b.id === id)
        if (index !== -1) {
          this.inventory[index] = { ...this.inventory[index], ...updatedData }
        }
      } else {
        console.error('Failed to update book', res?.error)
        throw new Error(res?.error?.message || 'Failed to update book')
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
        this.requests.push(normalizeRequest(res.data) || normalizeRequest(newReq))
        const book = this.inventory.find(b => b.id === bookId)
        const notifications = useNotificationStore()
        notifications.addNotification('Alert', `${userName} has requested to borrow "${book?.title}".`, 'librarian')
      } else {
        console.error('Failed to request book', res?.error)
        throw new Error(res?.error?.message || 'Failed to request book')
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
        this.requests.push(normalizeRequest(res.data) || normalizeRequest(newReq))
        const notifications = useNotificationStore()
        notifications.addNotification('System', `${userName} has suggested a new book: "${title}".`, 'librarian')
      } else {
        console.error('Failed to submit new book request', res?.error)
        throw new Error(res?.error?.message || 'Failed to submit new book request')
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
          const updatedBook = { availablecopies: available - 1 }
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
          const updatedBook = { availablecopies: available + 1 }
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
