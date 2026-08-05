import { defineStore } from 'pinia'
import { ApiClient } from '../services/apiClient'
import { useAppointmentsStore } from './appointments'
import { useNotificationStore } from './notifications'

export const useTimetablesStore = defineStore('timetables', {
  state: () => ({
    slots: [],
    isLoading: false
  }),
  actions: {
    async fetchTimetables() {
      this.isLoading = true
      const data = await ApiClient.get('timetables')
      if (data) {
        const apptStore = useAppointmentsStore()
        this.slots = data.map(s => {
          // appointment_id is stored directly now (added via migration).
          // Fall back to the old "first appointment for this teacher"
          // heuristic only for legacy rows that predate the column.
          let appointmentId = s.appointment_id ?? null
          if (!appointmentId) {
            const appt = apptStore.appointments.find(a => a.teacher_id === s.teacher_id)
            appointmentId = appt ? appt.id : null
          }
          return {
            id: s.id,
            appointmentId,
            teacher_id: s.teacher_id,
            day: s.day,
            period: s.time_slot,
            status: s.status
          }
        })
      }
      this.isLoading = false
    },
    async requestSlot(appointmentId, day, period) {
      const apptStore = useAppointmentsStore()
      const appt = apptStore.appointments.find(a => a.id === appointmentId)
      const payload = {
        teacher_id: appt?.teacher_id || 'Unknown',
        appointment_id: appointmentId,
        day,
        time_slot: period,
        status: 'pending'
      }
      const res = await ApiClient.post('timetables', payload)
      if (res && res.success) {
        this.slots.push({
          id: res.data.id,
          appointmentId,
          teacher_id: payload.teacher_id,
          day,
          period,
          status: 'pending'
        })
        const notifStore = useNotificationStore()
        notifStore.addNotification('info', `A new timetable request for ${day} requires HOD approval.`, 'hod')
      } else {
        console.error('Failed to request slot', res?.error)
        throw new Error(res?.error?.message || 'Failed to request slot')
      }
    },
    async approveSlot(slotId) {
      const slot = this.slots.find(s => s.id === slotId)
      if (!slot) return { success: false, message: 'Slot not found' }
      
      const conflict = this.checkConflict(slot.appointmentId, slot.day, slot.period, slotId)
      if (conflict) {
        return { success: false, message: `Conflict detected with an approved slot: ${conflict}` }
      }
      
      const res = await ApiClient.put('timetables', slotId, { status: 'approved' })
      if (res && res.success) {
        slot.status = 'approved'
        const notifStore = useNotificationStore()
        notifStore.addNotification('success', `Timetable request for ${slot.day} at ${slot.period} was approved!`, 'teacher')
        return { success: true }
      }
      return { success: false, message: 'API Error' }
    },
    async rejectSlot(slotId) {
      const slot = this.slots.find(s => s.id === slotId)
      if (slot) {
        const res = await ApiClient.put('timetables', slotId, { status: 'rejected' })
        if (res && res.success) {
          slot.status = 'rejected'
          const notifStore = useNotificationStore()
          notifStore.addNotification('warning', `Timetable request for ${slot.day} at ${slot.period} was rejected.`, 'teacher')
        }
      }
    },
    async createApprovedSlot(appointmentId, day, period) {
      const conflict = this.checkConflict(appointmentId, day, period)
      if (conflict) {
        return { success: false, message: `Conflict detected: ${conflict}` }
      }
      
      const apptStore = useAppointmentsStore()
      const appt = apptStore.appointments.find(a => a.id === appointmentId)
      const payload = {
        teacher_id: appt?.teacher_id || 'Unknown',
        appointment_id: appointmentId,
        day,
        time_slot: period,
        status: 'approved'
      }
      
      const res = await ApiClient.post('timetables', payload)
      if (res && res.success) {
        this.slots.push({
          id: res.data.id,
          appointmentId,
          teacher_id: payload.teacher_id,
          day,
          period,
          status: 'approved'
        })
        return { success: true }
      }
      return { success: false, message: res?.error?.message || 'API Error' }
    },
    async deleteSlot(slotId) {
      const res = await ApiClient.delete('timetables', slotId)
      if (res && res.success) {
        this.slots = this.slots.filter(s => s.id !== slotId)
      } else {
        console.error('Failed to delete slot', res?.error)
        throw new Error(res?.error?.message || 'Failed to delete slot')
      }
    },
    
    checkConflict(appointmentId, day, period, ignoreSlotId = null) {
      const appointmentsStore = useAppointmentsStore()
      
      const newAppt = appointmentsStore.appointments.find(a => a.id === appointmentId)
      if (!newAppt) return 'Invalid appointment'

      const approvedSlots = this.slots.filter(s => s.status === 'approved' && s.id !== ignoreSlotId)

      for (const existingSlot of approvedSlots) {
        if (existingSlot.day === day && existingSlot.period === period) {
          const existingAppt = appointmentsStore.appointments.find(a => a.id === existingSlot.appointmentId)
          if (!existingAppt) continue

          if (existingAppt.teacher_id === newAppt.teacher_id) return 'Teacher is already booked.'
          if (existingAppt.room_id === newAppt.room_id) return 'Room is already occupied.'
          if (existingAppt.section_id === newAppt.section_id) return 'Section already has a class.'
        }
      }
      return null 
    }
  }
})
