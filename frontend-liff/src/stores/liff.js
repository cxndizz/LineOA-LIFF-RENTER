// File: frontend-liff/src/stores/liff.js
import { ref } from 'vue'
import { defineStore } from 'pinia'
import liff from '@line/liff'

export const useLiffStore = defineStore('liff', () => {
  const profile = ref(null)
  const isLoggedIn = ref(false)
  
  // ⚠️ เปลี่ยนเป็น LIFF ID ของคุณ (จาก LINE Developers Console)
  const LIFF_ID = 'YOUR_LIFF_ID_HERE' 

  const init = async () => {
    try {
      await liff.init({ liffId: LIFF_ID })
      
      if (liff.isLoggedIn()) {
        isLoggedIn.value = true
        profile.value = await liff.getProfile()
        console.log('LIFF Logged in:', profile.value)
      } else {
        // ถ้ายังไม่ล็อกอิน ให้ Login อัตโนมัติ (หรือจะทำปุ่มกดก็ได้)
        liff.login()
      }
    } catch (error) {
      console.error('LIFF Init failed:', error)
    }
  }

  return { profile, isLoggedIn, init }
})