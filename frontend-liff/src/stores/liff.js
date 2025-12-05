// File: frontend-liff/src/stores/liff.js
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import liff from '@line/liff'

export const useLiffStore = defineStore('liff', () => {
  // States
  const profile = ref(null)
  const isLoggedIn = ref(false)
  const isLoading = ref(true)
  const error = ref(null)
  const isInClient = ref(false) // ใช้งานใน LINE App หรือ External Browser

  // Get LIFF ID from environment variable
  const LIFF_ID = import.meta.env.VITE_LIFF_ID || 'YOUR_LIFF_ID_HERE'

  // Computed
  const userId = computed(() => profile.value?.userId || null)
  const displayName = computed(() => profile.value?.displayName || 'ผู้ใช้')
  const pictureUrl = computed(() => profile.value?.pictureUrl || null)

  /**
   * Initialize LIFF SDK
   */
  const init = async () => {
    isLoading.value = true
    error.value = null

    try {
      console.log('🚀 Initializing LIFF...')

      // Init LIFF
      await liff.init({ liffId: LIFF_ID })

      // Check if running in LINE client
      isInClient.value = liff.isInClient()
      console.log('📱 Is in LINE Client:', isInClient.value)

      // Check if logged in
      if (liff.isLoggedIn()) {
        console.log('✅ Already logged in')
        isLoggedIn.value = true

        // Get user profile
        const userProfile = await liff.getProfile()
        profile.value = userProfile
        console.log('👤 User Profile:', userProfile)
      } else {
        console.log('❌ Not logged in, redirecting to LINE Login...')
        // Auto login
        liff.login()
      }
    } catch (err) {
      console.error('❌ LIFF Init failed:', err)
      error.value = err.message || 'Failed to initialize LIFF'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Login (manual trigger)
   */
  const login = () => {
    if (!liff.isLoggedIn()) {
      liff.login()
    }
  }

  /**
   * Logout
   */
  const logout = () => {
    if (liff.isLoggedIn()) {
      liff.logout()
      isLoggedIn.value = false
      profile.value = null
    }
  }

  /**
   * Close LIFF window
   */
  const closeLiff = () => {
    if (liff.isInClient()) {
      liff.closeWindow()
    }
  }

  /**
   * Send message to chat (requires specific permissions)
   */
  const sendMessages = async (messages) => {
    try {
      if (liff.isApiAvailable('shareTargetPicker')) {
        await liff.shareTargetPicker(messages)
        return true
      } else {
        console.warn('shareTargetPicker is not available')
        return false
      }
    } catch (err) {
      console.error('Failed to send messages:', err)
      return false
    }
  }

  /**
   * Get access token
   */
  const getAccessToken = () => {
    return liff.getAccessToken()
  }

  return {
    // States
    profile,
    isLoggedIn,
    isLoading,
    error,
    isInClient,

    // Computed
    userId,
    displayName,
    pictureUrl,

    // Actions
    init,
    login,
    logout,
    closeLiff,
    sendMessages,
    getAccessToken
  }
})