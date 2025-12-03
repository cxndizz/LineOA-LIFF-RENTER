// File: src/services/branch.service.js
import api from '../utils/axios'

export const branchService = {
  // ดึงข้อมูลสาขาทั้งหมด
  async getAll() {
    const response = await api.get('/branches')
    return response.data
  },

  // สร้างสาขาใหม่
  async create(data) {
    const response = await api.post('/branches', data)
    return response.data
  },

  // แก้ไขสาขา
  async update(id, data) {
    const response = await api.patch(`/branches/${id}`, data)
    return response.data
  },

  // ลบสาขา
  async delete(id) {
    const response = await api.delete(`/branches/${id}`)
    return response.data
  }
}