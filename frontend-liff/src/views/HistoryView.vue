<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLiffStore } from '@/stores/liff'
import api from '@/utils/axios'
import dayjs from 'dayjs'

const router = useRouter()
const liffStore = useLiffStore()

const historyData = ref(null)
const isLoading = ref(true)
const error = ref(null)

// Image URL helper
const getImageUrl = (path) => {
  if (!path) return ''
  const cleanPath = path.startsWith('/') ? path.substring(1) : path
  return `${api.defaults.baseURL}/${cleanPath}`
}

// Status colors and labels
const statusConfig = {
  PENDING_PAYMENT: { color: 'bg-yellow-100 text-yellow-800', label: 'รอชำระเงิน', icon: '⏳' },
  WAITING_CONFIRMATION: { color: 'bg-orange-100 text-orange-800', label: 'รอตรวจสอบ', icon: '🔍' },
  APPROVED: { color: 'bg-green-100 text-green-800', label: 'อนุมัติแล้ว', icon: '✅' },
  WAITING_DELIVERY: { color: 'bg-blue-100 text-blue-800', label: 'รอรับของ', icon: '📦' },
  IN_USE: { color: 'bg-purple-100 text-purple-800', label: 'กำลังเช่า', icon: '🚀' },
  RETURNED: { color: 'bg-gray-100 text-gray-800', label: 'คืนแล้ว', icon: '✓' },
  CANCELLED: { color: 'bg-red-100 text-red-800', label: 'ยกเลิก', icon: '❌' },
  REJECTED: { color: 'bg-red-100 text-red-800', label: 'ไม่อนุมัติ', icon: '🚫' },
}

// Fetch history
const fetchHistory = async () => {
  if (!liffStore.userId) {
    error.value = 'กรุณาเข้าสู่ระบบก่อน'
    isLoading.value = false
    return
  }

  isLoading.value = true
  error.value = null

  try {
    const response = await api.get(`/rentals/my-history/${liffStore.userId}`)
    historyData.value = response.data
  } catch (err) {
    console.error('Failed to fetch history:', err)
    error.value = 'ไม่สามารถโหลดข้อมูลได้'
  } finally {
    isLoading.value = false
  }
}

// Stats computed
const stats = computed(() => {
  if (!historyData.value) return null

  const active = historyData.value.rentals.filter(
    r => ['APPROVED', 'WAITING_DELIVERY', 'IN_USE'].includes(r.status)
  ).length

  const completed = historyData.value.rentals.filter(
    r => r.status === 'RETURNED'
  ).length

  return { active, completed }
})

onMounted(() => {
  fetchHistory()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 pb-20">
    <!-- Header -->
    <div class="bg-white px-4 py-4 shadow-sm sticky top-0 z-10">
      <div class="flex items-center gap-3 mb-3">
        <button @click="router.push('/')" class="text-2xl">⬅️</button>
        <div>
          <h1 class="font-bold text-lg">ประวัติการเช่า</h1>
          <p class="text-xs text-gray-500">Rental History</p>
        </div>
      </div>

      <!-- User Info -->
      <div v-if="liffStore.isLoggedIn" class="flex items-center gap-3 mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
        <img
          v-if="liffStore.pictureUrl"
          :src="liffStore.pictureUrl"
          alt="Profile"
          class="w-12 h-12 rounded-full border-2 border-blue-500"
        />
        <div
          v-else
          class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg"
        >
          {{ liffStore.displayName?.charAt(0) || 'U' }}
        </div>
        <div class="flex-1">
          <p class="font-semibold text-gray-800">{{ liffStore.displayName }}</p>
          <p class="text-xs text-gray-500">สมาชิก LINE OA</p>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-16">
      <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="text-gray-500">กำลังโหลดข้อมูล...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="p-4">
      <div class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <div class="text-4xl mb-3">⚠️</div>
        <p class="text-red-600 mb-4">{{ error }}</p>
        <button @click="fetchHistory" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
          ลองใหม่อีกครั้ง
        </button>
      </div>
    </div>

    <!-- Content -->
    <div v-else-if="historyData" class="p-4 space-y-4">
      <!-- Stats Cards -->
      <div class="grid grid-cols-3 gap-3">
        <div class="bg-white p-4 rounded-xl shadow-sm border text-center">
          <div class="text-2xl font-bold text-blue-600">{{ historyData.totalRentals }}</div>
          <div class="text-xs text-gray-500 mt-1">ทั้งหมด</div>
        </div>
        <div class="bg-white p-4 rounded-xl shadow-sm border text-center">
          <div class="text-2xl font-bold text-purple-600">{{ stats.active }}</div>
          <div class="text-xs text-gray-500 mt-1">กำลังเช่า</div>
        </div>
        <div class="bg-white p-4 rounded-xl shadow-sm border text-center">
          <div class="text-2xl font-bold text-green-600">{{ stats.completed }}</div>
          <div class="text-xs text-gray-500 mt-1">เสร็จแล้ว</div>
        </div>
      </div>

      <!-- Total Spent -->
      <div class="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-xl shadow-lg text-white">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-green-100 text-sm mb-1">ยอดใช้จ่ายทั้งหมด</p>
            <p class="text-3xl font-bold">฿{{ historyData.totalSpent.toLocaleString() }}</p>
          </div>
          <div class="text-5xl opacity-50">💰</div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="historyData.rentals.length === 0" class="bg-white p-12 rounded-xl shadow-sm text-center">
        <div class="text-6xl mb-4">📦</div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">ยังไม่มีประวัติการเช่า</h3>
        <p class="text-gray-500 mb-6">เริ่มต้นเช่าสินค้าของเราวันนี้!</p>
        <button
          @click="router.push('/')"
          class="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          เลือกสินค้าเลย 🚀
        </button>
      </div>

      <!-- Rental List -->
      <div v-else class="space-y-3">
        <h3 class="font-bold text-gray-800 flex items-center gap-2 mt-2">
          <span>📋</span> รายการทั้งหมด ({{ historyData.rentals.length }})
        </h3>

        <div
          v-for="rental in historyData.rentals"
          :key="rental.id"
          class="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
        >
          <div class="flex gap-3 p-3">
            <!-- Product Image -->
            <div class="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              <img
                v-if="rental.productImage"
                :src="getImageUrl(rental.productImage)"
                :alt="rental.productName"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                📷
              </div>
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <h4 class="font-semibold text-gray-900 text-sm line-clamp-1">{{ rental.productName }}</h4>
              <p class="text-xs text-gray-500 mb-1">{{ rental.branchName }}</p>

              <div class="flex items-center gap-2 text-xs text-gray-600 mb-2">
                <span>📅 {{ dayjs(rental.startDate).format('DD/MM/YY') }}</span>
                <span>→</span>
                <span>{{ dayjs(rental.endDate).format('DD/MM/YY') }}</span>
              </div>

              <div class="flex items-center justify-between">
                <span
                  class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold"
                  :class="statusConfig[rental.status]?.color"
                >
                  <span>{{ statusConfig[rental.status]?.icon }}</span>
                  {{ statusConfig[rental.status]?.label }}
                </span>
                <span class="font-bold text-blue-600">฿{{ rental.totalPrice.toLocaleString() }}</span>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="bg-gray-50 px-3 py-2 flex items-center justify-between text-xs">
            <span class="text-gray-500 font-mono">{{ rental.rentalRef }}</span>
            <span class="text-gray-400">{{ dayjs(rental.createdAt).format('DD MMM YYYY') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
