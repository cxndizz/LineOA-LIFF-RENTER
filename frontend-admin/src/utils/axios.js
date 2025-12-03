// File: src/utils/axios.js
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000', // URL ของ Backend NestJS
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// เพิ่ม Interceptor: ถ้ามี Token ให้แนบไปกับทุก Request โดยอัตโนมัติ
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default api