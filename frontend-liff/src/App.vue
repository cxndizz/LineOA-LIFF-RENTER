<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useLiffStore } from '@/stores/liff'

const liffStore = useLiffStore()

onMounted(async () => {
  // Initialize LIFF on app mount
  await liffStore.init()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex justify-center">
    <div class="w-full max-w-md bg-white min-h-screen shadow-lg relative">
      <!-- Loading Screen -->
      <div
        v-if="liffStore.isLoading"
        class="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center"
      >
        <div class="mb-4">
          <div class="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p class="text-gray-600 font-medium">กำลังเชื่อมต่อ LINE...</p>
        <p class="text-gray-400 text-sm mt-2">โปรดรอสักครู่</p>
      </div>

      <!-- Error Screen -->
      <div
        v-else-if="liffStore.error"
        class="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-6"
      >
        <div class="text-6xl mb-4">❌</div>
        <h2 class="text-xl font-bold text-gray-800 mb-2">เกิดข้อผิดพลาด</h2>
        <p class="text-gray-600 text-center mb-6">{{ liffStore.error }}</p>
        <button
          @click="liffStore.init()"
          class="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors"
        >
          ลองอีกครั้ง
        </button>
      </div>

      <!-- Main App -->
      <RouterView v-else />
    </div>
  </div>
</template>

<style>
/* Smooth transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>