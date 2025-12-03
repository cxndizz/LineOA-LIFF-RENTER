// File: src/stores/auth.js
import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '../utils/axios'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || '')
  const router = useRouter()

  // ฟังก์ชันล็อกอิน
  const login = async (email, password) => {
    try {
      // 1. ยิง API ไปที่ Backend
      const response = await api.post('/auth/login', { email, password })
      
      // 2. ถ้าสำเร็จ เก็บข้อมูลลง State และ LocalStorage
      const { access_token, user: userData } = response.data
      token.value = access_token
      user.value = userData
      
      localStorage.setItem('token', access_token)
      localStorage.setItem('user', JSON.stringify(userData))

      // 3. แจ้งเตือนหรือส่งค่ากลับ (ในที่นี้ return true)
      return true
    } catch (error) {
      console.error('Login failed:', error)
      throw error.response?.data?.message || 'Login failed'
    }
  }

  // ฟังก์ชัน Logout
  const logout = () => {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // ถ้าต้องการ redirect ให้ทำที่ component หรือใช้ router.push('/login')
  }

  return { user, token, login, logout }
})