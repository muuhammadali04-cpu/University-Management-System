import { defineStore } from 'pinia'
import { ApiClient } from '../services/apiClient'

// The real table (see supabase_schema.sql) is `notices` with columns
// (title, content, author, role, date) - NOT `communication_notices` with
// an `author_id` column. That mismatch meant every notice silently failed
// to save. We keep authorId inside the JSON-encoded content (like the
// leaves store does) purely so the "delete my own notice" check keeps
// working, since the real table has no author_id column.
const TABLE = 'notices'

export const useNoticesStore = defineStore('notices', {
  state: () => ({
    notices: [],
    isLoading: false
  }),
  actions: {
    async fetchNotices() {
      this.isLoading = true
      const data = await ApiClient.get(TABLE)
      if (data) {
        this.notices = data.map(notice => {
          let content = notice.content
          let authorId = null
          try {
            const parsed = JSON.parse(notice.content)
            if (parsed.isJson) {
              content = parsed.content
              authorId = parsed.authorId ?? null
            }
          } catch (e) {}
          return {
            id: notice.id,
            title: notice.title,
            content,
            authorId,
            author: notice.author,
            date: notice.date ? new Date(notice.date).toLocaleDateString() : ''
          }
        })
      }
      this.isLoading = false
    },
    async addNotice(notice) {
      const payload = {
        title: notice.title,
        content: JSON.stringify({
          isJson: true,
          content: notice.content,
          authorId: notice.authorId
        }),
        author: notice.author || 'Admin',
        role: notice.role || 'general',
        date: new Date().toISOString().slice(0, 10)
      }
      const res = await ApiClient.post(TABLE, payload)
      if (res && res.success) {
        this.notices.unshift({
          id: res.data.id,
          title: notice.title,
          content: notice.content,
          author: notice.author,
          authorId: notice.authorId,
          date: new Date().toLocaleDateString()
        })
      } else {
        console.error('Failed to add notice', res?.error)
        throw new Error(res?.error?.message || 'Failed to post notice')
      }
    },
    async deleteNotice(id) {
      const res = await ApiClient.delete(TABLE, id)
      if (res && res.success) {
        this.notices = this.notices.filter(n => n.id !== id)
      } else {
        console.error('Failed to delete notice', res?.error)
        throw new Error(res?.error?.message || 'Failed to delete notice')
      }
    }
  }
})
