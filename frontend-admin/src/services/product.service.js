// File: src/services/product.service.js
import api from '../utils/axios'

export const productService = {
  async getAll() {
    const response = await api.get('/products')
    return response.data
  },

  async create(data) {
    // แปลง Object -> FormData เพื่อส่งไฟล์
    const formData = new FormData()
    for (const key in data) {
      if (key === 'images' && data[key]) {
        // กรณีเป็นไฟล์รูปภาพ (รองรับหลายไฟล์)
        for (let i = 0; i < data[key].length; i++) {
          formData.append('images', data[key][i])
        }
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key])
      }
    }

    const response = await api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  async update(id, data) {
    // การแก้ไขสินค้า (เบื้องต้นแก้แค่ Text ก่อนตาม API ที่ทำไว้)
    const response = await api.patch(`/products/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/products/${id}`)
    return response.data
  }
}