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
    if (!data || data.length === 0) {
      const notFoundError = { message: `Insert into "${resource}" returned no row.` }
      console.error('Supabase POST Error:', notFoundError.message)
      return { success: false, error: notFoundError }
    }
    return { success: true, data: data[0] }
  },

  async put(resource, id, payload) {
    const { data, error } = await supabase.from(resource).update(payload).eq('id', id).select()
    if (error) {
      console.error('Supabase PUT Error:', error)
      return { success: false, error }
    }
    // Supabase does NOT return an error when an update matches zero rows -
    // it just returns an empty array. Without this check, every update
    // (approve/reject/edit buttons across the whole app) reported success
    // even when nothing was actually changed in the database.
    if (!data || data.length === 0) {
      const notFoundError = { message: `No matching row found in "${resource}" for id "${id}" - nothing was updated.` }
      console.error('Supabase PUT Error:', notFoundError.message)
      return { success: false, error: notFoundError }
    }
    return { success: true, data: data[0] }
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
