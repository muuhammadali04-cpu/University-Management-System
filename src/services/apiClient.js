import { supabase } from '../supabase'

export const ApiClient = {
  async get(resource) {
    const { data, error } = await supabase.from(resource).select('*')
    if (error) {
      console.error('Supabase GET Error:', error)
      return null
    }
    return data
  },
  
  async post(resource, payload) {
    const { data, error } = await supabase.from(resource).insert(payload).select()
    if (error) {
      console.error('Supabase POST Error:', error)
      return { success: false, error }
    }
    return { success: true, data: data[0] || payload }
  },

  async put(resource, id, payload) {
    const { data, error } = await supabase.from(resource).update(payload).eq('id', id).select()
    if (error) {
      console.error('Supabase PUT Error:', error)
      return { success: false, error }
    }
    return { success: true, data: data[0] || payload }
  },

  async delete(resource, id) {
    const { error } = await supabase.from(resource).delete().eq('id', id)
    if (error) {
      console.error('Supabase DELETE Error:', error)
      return { success: false, error }
    }
    return { success: true }
  },

  async checkConnection() {
    try {
      const { error } = await supabase.from('users').select('id').limit(1)
      if (error) throw error
      return true
    } catch (e) {
      return false
    }
  }
}
