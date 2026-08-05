import { defineStore } from 'pinia'
import { ApiClient } from '../services/apiClient'
import { useUsersStore } from './users'

export const useFinanceStore = defineStore('finance', {
  state: () => ({
    vouchers: [],
    payrolls: [],
    salarySlips: [],
    isLoading: false
  }),
  getters: {
    getStudentVouchers: (state) => (studentId) => state.vouchers.filter(v => v.student_id === studentId),
    getTeacherSalarySlips: (state) => (teacherId) => state.salarySlips.filter(s => s.teacher_id === teacherId),
    getAllVouchers: (state) => state.vouchers
  },
  actions: {
    async fetchFinanceData() {
      this.isLoading = true
      const vouchers = await ApiClient.get('finance_vouchers')
      const payrolls = await ApiClient.get('finance_payrolls')
      
      if (vouchers) this.vouchers = vouchers
      if (payrolls) this.payrolls = payrolls
      this.isLoading = false
    },
    async payVoucher(voucherId) {
      const voucher = this.vouchers.find(v => v.id === voucherId)
      if (voucher) {
        const res = await ApiClient.put('finance_vouchers', voucherId, { status: 'Paid' })
        if (res && res.success) voucher.status = 'Paid'
        else { console.error('Failed to mark voucher paid', res?.error); throw new Error(res?.error?.message || 'Failed to mark voucher paid') }
      }
    },
    async markUnpaid(voucherId) {
      const voucher = this.vouchers.find(v => v.id === voucherId)
      if (voucher) {
        const res = await ApiClient.put('finance_vouchers', voucherId, { status: 'Unpaid' })
        if (res && res.success) voucher.status = 'Unpaid'
        else { console.error('Failed to mark voucher unpaid', res?.error); throw new Error(res?.error?.message || 'Failed to mark voucher unpaid') }
      }
    },
    async generateVouchersForSection(sectionId, type, amount, dueDate) {
      const usersStore = useUsersStore()
      const targetStudents = usersStore.users.filter(u => u.role === 'student' && u.section_id === sectionId)
      
      for (const student of targetStudents) {
        const newVoucher = {
          id: 'VCH-' + Date.now() + Math.floor(Math.random() * 1000),
          student_id: student.id,
          type,
          amount,
          status: 'Unpaid',
          due_date: dueDate
        }
        const res = await ApiClient.post('finance_vouchers', newVoucher)
        if (res && res.success) {
          this.vouchers.push(res.data || newVoucher)
        } else {
          console.error('Failed to generate voucher', res?.error)
          throw new Error(res?.error?.message || 'Failed to generate vouchers')
        }
      }
    },
    async processPayroll(month, totalAmount) {
      const newPayroll = {
        month,
        total_amount: totalAmount,
        status: 'Processed'
      }
      const res = await ApiClient.post('finance_payrolls', newPayroll)
      if (res && res.success) {
        this.payrolls.push(res.data || newPayroll)
      } else {
        console.error('Failed to process payroll', res?.error)
        throw new Error(res?.error?.message || 'Failed to process payroll')
      }
    }
  }
})
