import { useUsersStore } from './store/users'
import { useAppointmentsStore } from './store/appointments'
import { useTimetablesStore } from './store/timetables'

export function bootstrapData() {
  const usersStore = useUsersStore()
  const apptStore = useAppointmentsStore()
  const timetablesStore = useTimetablesStore()
  
  
  const jane = usersStore.users.find(u => u.id === 'STD-F23-01')
  if (jane && !jane.sectionId) {
    jane.sectionId = 1
  }
  
  
  if (apptStore.appointments.length === 0) {
    apptStore.addAppointment({ id: 1, teacherId: 'FAC-001', subjectId: 1, roomId: 1, sectionId: 1 })
  }
  
  
  if (timetablesStore.slots.length === 0) {
    timetablesStore.slots = [
      { id: 1, appointmentId: 1, day: 'Monday', period: '09:00 - 10:00', status: 'approved' },
      { id: 2, appointmentId: 1, day: 'Tuesday', period: '10:00 - 11:00', status: 'approved' },
      { id: 3, appointmentId: 1, day: 'Wednesday', period: '08:00 - 09:00', status: 'approved' },
      { id: 4, appointmentId: 1, day: 'Thursday', period: '13:00 - 14:00', status: 'approved' },
      { id: 5, appointmentId: 1, day: 'Friday', period: '14:00 - 15:00', status: 'approved' }
    ]
  } else {
    
    timetablesStore.slots.forEach(slot => {
      if (slot.appointmentId === 1 && (slot.status === 'pending' || slot.status === 'Pending')) {
        slot.status = 'approved'
      }
    })
  }
}
