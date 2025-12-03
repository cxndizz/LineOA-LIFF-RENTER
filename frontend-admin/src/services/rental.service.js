// File: frontend-admin/src/services/rental.service.js
import api from '../utils/axios'

export const rentalService = {
  async getAll() {
    const response = await api.get('/rentals')
    return response.data
  },

  async updateStatus(id, status, note = '') {
    const response = await api.patch(`/rentals/${id}/status`, { status, note })
    return response.data
  }
}