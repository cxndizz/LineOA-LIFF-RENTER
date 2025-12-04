import api from '../utils/axios'

export const dashboardService = {
  // ดึงสถิติภาพรวม
  async getStats() {
    const response = await api.get('/dashboard/stats')
    return response.data
  },

  // ดึงข้อมูลกราฟรายได้ (ถ้ามี)
  async getRevenueChart(period = '7days') {
    const response = await api.get(`/dashboard/revenue?period=${period}`)
    return response.data
  },

  // ดึงออร์เดอร์ล่าสุด
  async getRecentOrders(limit = 5) {
    const response = await api.get(`/dashboard/recent-orders?limit=${limit}`)
    return response.data
  },

  // ดึงสินค้ายอดนิยม
  async getTopProducts(limit = 5) {
    const response = await api.get(`/dashboard/top-products?limit=${limit}`)
    return response.data
  }
}
