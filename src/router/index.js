import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth'


import Login from '../views/auth/Login.vue'
import MainLayout from '../components/layout/MainLayout.vue'
import Dashboard from '../views/dashboard/Dashboard.vue'
import UserDirectory from '../views/admin/UserDirectory.vue'
import Infrastructure from '../views/admin/Infrastructure.vue'
import Appointments from '../views/admin/Appointments.vue'
import HodDirectory from '../views/hod/HodDirectory.vue'
import PendingApprovals from '../views/hod/PendingApprovals.vue'
import MasterTimetable from '../views/hod/MasterTimetable.vue'
import HodLeaves from '../views/hod/Leaves.vue'
import TeacherAttendance from '../views/teacher/Attendance.vue'
import TeacherGrading from '../views/teacher/Grading.vue'
import TeacherTimetable from '../views/teacher/TeacherTimetable.vue'
import TeacherLeaves from '../views/teacher/Leaves.vue'
import StudentTimetable from '../views/student/Timetable.vue'
import StudentGrades from '../views/student/Grades.vue'
import StudentAttendance from '../views/student/Attendance.vue'
import StudentLeaves from '../views/student/Leaves.vue'
import StudentFees from '../views/student/Fees.vue'

import TeacherSalary from '../views/teacher/Salary.vue'

import FinanceFees from '../views/finance/Fees.vue'
import FinanceSalaries from '../views/finance/Salaries.vue'

import HrAttendance from '../views/hr/Attendance.vue'
import HrFines from '../views/hr/Fines.vue'
import HrEmployees from '../views/hr/Employees.vue'

import Library from '../views/shared/Library.vue'
import LibrarianInventory from '../views/librarian/Inventory.vue'
import LibrarianApprovals from '../views/librarian/Approvals.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: Dashboard
      },
      
      {
        path: 'admin/users',
        name: 'AdminUsers',
        component: UserDirectory
      },
      {
        path: 'admin/infrastructure',
        name: 'AdminInfrastructure',
        component: Infrastructure
      },
      {
        path: 'admin/appointments',
        name: 'AdminAppointments',
        component: Appointments
      },
      
      {
        path: 'hod/directory',
        name: 'HodDirectory',
        component: HodDirectory
      },
      {
        path: 'hod/appointments',
        name: 'HodAppointments',
        component: Appointments
      },
      {
        path: 'hod/pending-approvals',
        name: 'HodPendingApprovals',
        component: PendingApprovals
      },
      {
        path: 'hod/timetable',
        name: 'HodTimetable',
        component: MasterTimetable
      },
      {
        path: 'hod/leaves',
        name: 'HodLeaves',
        component: HodLeaves
      },
      
      {
        path: 'teacher/attendance',
        name: 'TeacherAttendance',
        component: TeacherAttendance
      },
      {
        path: 'teacher/grading',
        name: 'TeacherGrading',
        component: TeacherGrading
      },
      {
        path: 'teacher/timetable',
        name: 'TeacherTimetable',
        component: TeacherTimetable
      },
      {
        path: 'teacher/leaves',
        name: 'TeacherLeaves',
        component: TeacherLeaves
      },
      {
        path: 'teacher/salary',
        name: 'TeacherSalary',
        component: TeacherSalary
      },
      
      {
        path: 'student/timetable',
        name: 'StudentTimetable',
        component: StudentTimetable
      },
      {
        path: 'student/grades',
        name: 'StudentGrades',
        component: StudentGrades
      },
      {
        path: 'student/attendance',
        name: 'StudentAttendance',
        component: StudentAttendance
      },
      {
        path: 'student/leaves',
        name: 'StudentLeaves',
        component: StudentLeaves
      },
      {
        path: 'student/fees',
        name: 'StudentFees',
        component: StudentFees
      },
      
      {
        path: 'finance/fees',
        name: 'FinanceFees',
        component: FinanceFees
      },
      {
        path: 'finance/salaries',
        name: 'FinanceSalaries',
        component: FinanceSalaries
      },
      
      {
        path: 'hr/attendance',
        name: 'HrAttendance',
        component: HrAttendance
      },
      {
        path: 'hr/fines',
        name: 'HrFines',
        component: HrFines
      },
      {
        path: 'hr/employees',
        name: 'HrEmployees',
        component: HrEmployees
      },
      
      {
        path: 'library',
        name: 'Library',
        component: Library
      },
      
      {
        path: 'librarian/inventory',
        name: 'LibrarianInventory',
        component: LibrarianInventory
      },
      {
        path: 'librarian/approvals',
        name: 'LibrarianApprovals',
        component: LibrarianApprovals
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login' })
  } else if (to.meta.requiresGuest && isAuthenticated) {
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router
