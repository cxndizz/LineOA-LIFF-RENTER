import { ref, h, render } from 'vue'
import Toast from '@/components/Toast.vue'

// Toast container สำหรับเก็บ toast instances
const toasts = ref([])

export function useToast() {
  // ฟังก์ชันสร้าง Toast Container (ครั้งแรกเท่านั้น)
  const ensureContainer = () => {
    let container = document.getElementById('toast-container')
    if (!container) {
      container = document.createElement('div')
      container.id = 'toast-container'
      container.className = 'fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none'
      container.style.pointerEvents = 'none'
      document.body.appendChild(container)
    }
    return container
  }

  // ฟังก์ชันแสดง Toast
  const showToast = (type, message, duration = 3000) => {
    const container = ensureContainer()

    // สร้าง wrapper div สำหรับ toast นี้
    const toastWrapper = document.createElement('div')
    toastWrapper.style.pointerEvents = 'auto'
    container.appendChild(toastWrapper)

    // สร้าง Toast Component
    const toastVNode = h(Toast, {
      type,
      message,
      duration,
      onClose: () => {
        // ลบ toast ออกจาก DOM
        render(null, toastWrapper)
        container.removeChild(toastWrapper)
      }
    })

    // Render Toast
    render(toastVNode, toastWrapper)
  }

  return {
    success: (message, duration) => showToast('success', message, duration),
    error: (message, duration) => showToast('error', message, duration),
    warning: (message, duration) => showToast('warning', message, duration),
    info: (message, duration) => showToast('info', message, duration)
  }
}
