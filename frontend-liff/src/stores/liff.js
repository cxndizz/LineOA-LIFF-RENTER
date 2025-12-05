import { defineStore } from 'pinia'
import liff from '@line/liff'

export const useLiffStore = defineStore('liff', {
  state: () => ({
    profile: null,
    isLoggedIn: false,
    isInClient: false,
    error: null,
    isLoading: true
  }),

  actions: {
    async init() {
      this.isLoading = true
      try {
        // ดึง LIFF ID จาก Environment Variable (.env)
        const liffId = import.meta.env.VITE_LIFF_ID

        if (!liffId) {
          throw new Error('LIFF ID is missing in .env file (VITE_LIFF_ID)')
        }

        console.log('Initializing LIFF with ID:', liffId)

        // เริ่มต้นการทำงานของ LIFF
        await liff.init({ liffId })

        // ตรวจสอบว่าเปิดในแอป LINE หรือไม่
        this.isInClient = liff.isInClient()

        // ตรวจสอบสถานะ Login
        if (liff.isLoggedIn()) {
          await this.getProfile()
          this.isLoggedIn = true
        } else {
          // ถ้ายังไม่ Login และเปิดใน External Browser ให้ Redirect ไปหน้า Login
          // แต่ถ้าเปิดใน LINE App มันควรจะ Login ให้อัตโนมัติ (ขึ้นอยู่กับการตั้งค่าใน Console)
          if (!this.isInClient) {
            liff.login() 
          }
        }
      } catch (err) {
        console.error('LIFF Init failed:', err)
        this.error = err.message || 'Failed to initialize LIFF'
      } finally {
        this.isLoading = false
      }
    },

    async getProfile() {
      try {
        const profile = await liff.getProfile()
        this.profile = {
          userId: profile.userId,
          displayName: profile.displayName,
          pictureUrl: profile.pictureUrl,
          statusMessage: profile.statusMessage
        }
        console.log('User Profile Loaded:', this.profile)
      } catch (err) {
        console.error('Get Profile failed:', err)
        this.error = 'Failed to load user profile'
      }
    },

    login() {
      if (!liff.isLoggedIn()) {
        liff.login()
      }
    },

    logout() {
      if (liff.isLoggedIn()) {
        liff.logout()
        this.isLoggedIn = false
        this.profile = null
        window.location.reload()
      }
    }
  }
})