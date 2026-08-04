import { defineStore } from 'pinia'
import { ApiClient } from '../services/apiClient'

export const useNoticesStore = defineStore('notices', {
  state: () => ({
    notices: [],
    isLoading: false
  }),
  actions: {
    async fetchNotices() {
      this.isLoading = true
      const data = await ApiClient.get('communication_notices')
      if (data) {
        this.notices = data.map(notice => {
          let author = 'Admin'
          try {
            const parsed = JSON.parse(notice.content)
            if (parsed.isJson) {
              notice.content = parsed.content
              author = parsed.author || author
            }
          } catch(e) {}
          return {
            id: notice.id,
            title: notice.title,
            content: notice.content,
            authorId: notice.author_id,
            author,
            date: new Date(notice.date).toLocaleDateString()
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
          author: notice.author
        }),
        author_id: notice.authorId
      }
      const res = await ApiClient.post('communication_notices', payload)
      if (res && res.success) {
        this.notices.unshift({
          id: res.data.id,
          title: notice.title,
          content: notice.content,
          author: notice.author,
          authorId: notice.authorId,
          date: new Date().toLocaleDateString()
        })
      }
    },
    async deleteNotice(id) {
      const res = await ApiClient.delete('communication_notices', id)
      if (res && res.success) {
        this.notices = this.notices.filter(n => n.id !== id)
      }
    }
  }
})
