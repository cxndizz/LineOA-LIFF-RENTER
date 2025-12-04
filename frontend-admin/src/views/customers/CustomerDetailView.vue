<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { customerService } from '@/services/customer.service'
import { useToast } from '@/composables/useToast'
import Skeleton from '@/components/Skeleton.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()

// State
const customer = ref(null)
const rentals = ref([])
const isLoading = ref(true)
const filterStatus = ref('ALL') // ALL, ACTIVE, COMPLETED, CANCELLED

const statusColors = {
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
  WAITING_CONFIRMATION: 'bg-orange-100 text-orange-800',
  APPROVED: 'bg-green-100 text-green-800',
  WAITING_DELIVERY: 'bg-blue-100 text-blue-800',
  IN_USE: 'bg-purple-100 text-purple-800',
  RETURNED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REJECTED: 'bg-red-100 text-red-800'
}

onMounted(async () => {
  await fetchCustomerData()
})

const fetchCustomerData = async () => {
  isLoading.value = true
  try {
    const customerId = route.params.id
    const [customerData, rentalsData] = await Promise.all([
      customerService.getOne(customerId),
      customerService.getRentalHistory(customerId)
    ])

    customer.value = customerData
    rentals.value = rentalsData
  } catch (error) {
    console.error('Error fetching customer data:', error)
    toast.error('ไม่สามารถโหลดข้อมูลลูกค้าได้')
    router.push('/customers')
  } finally {
    isLoading.value = false
  }
}

// ฟิลเตอร์ประวัติการเช่า
const filteredRentals = computed(() => {
  if (filterStatus.value === 'ALL') return rentals.value
  if (filterStatus.value === 'ACTIVE') {
    return rentals.value.filter(r => ['APPROVED', 'IN_USE', 'WAITING_DELIVERY'].includes(r.status))
  }
  if (filterStatus.value === 'COMPLETED') {
    return rentals.value.filter(r => r.status === 'RETURNED')
  }
  if (filterStatus.value === 'CANCELLED') {
    return rentals.value.filter(r => ['CANCELLED', 'REJECTED'].includes(r.status))
  }
  return rentals.value
})

// สถิติ
const customerStats = computed(() => {
  if (!rentals.value.length) {
    return { total: 0, active: 0, completed: 0, totalSpent: 0 }
  }

  return {
    total: rentals.value.length,
    active: rentals.value.filter(r => ['APPROVED', 'IN_USE', 'WAITING_DELIVERY'].includes(r.status)).length,
    completed: rentals.value.filter(r => r.status === 'RETURNED').length,
    totalSpent: rentals.value.reduce((sum, r) => sum + (r.totalPrice || 0), 0)
  }
})

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount || 0)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const goBack = () => {
  router.push('/customers')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <!-- Back Button -->
    <button
      @click="goBack"
      class="mb-6 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      <span class="font-medium">กลับไปหน้าลูกค้า</span>
    </button>

    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-6">
      <Skeleton type="card" />
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Skeleton type="stat-card" v-for="i in 4" :key="i" />
      </div>
      <Skeleton type="table" :count="5" />
    </div>

    <!-- Customer Data -->
    <div v-else-if="customer">
      <!-- Customer Profile Card -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
        <div class="flex flex-col md:flex-row items-start md:items-center gap-6">
          <!-- Avatar -->
          <div class="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-4xl shadow-xl">
            {{ customer.firstName?.[0] || '?' }}{{ customer.lastName?.[0] || '' }}
          </div>

          <!-- Info -->
          <div class="flex-1">
            <h2 class="text-3xl font-bold text-gray-800 mb-2">
              {{ customer.firstName }} {{ customer.lastName }}
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-600">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{{ customer.phoneNumber || '-' }}</span>
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>LINE: {{ customer.lineDisplayName || '-' }}</span>
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>{{ customer.email || '-' }}</span>
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>สมัครเมื่อ {{ formatDate(customer.createdAt) }}</span>
              </div>
            </div>
          </div>

          <!-- LINE Badge -->
          <div v-if="customer.lineUserId" class="px-4 py-2 bg-green-100 text-green-700 rounded-xl font-semibold text-sm">
            ✓ เชื่อมต่อ LINE แล้ว
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-xl text-white">
          <div class="text-blue-100 text-sm font-medium mb-2">การเช่าทั้งหมด</div>
          <div class="text-4xl font-bold">{{ customerStats.total }}</div>
          <div class="text-blue-100 text-xs mt-1">รายการ</div>
        </div>

        <div class="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-xl text-white">
          <div class="text-purple-100 text-sm font-medium mb-2">กำลังเช่าอยู่</div>
          <div class="text-4xl font-bold">{{ customerStats.active }}</div>
          <div class="text-purple-100 text-xs mt-1">รายการ</div>
        </div>

        <div class="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-2xl shadow-xl text-white">
          <div class="text-emerald-100 text-sm font-medium mb-2">เสร็จสิ้นแล้ว</div>
          <div class="text-4xl font-bold">{{ customerStats.completed }}</div>
          <div class="text-emerald-100 text-xs mt-1">รายการ</div>
        </div>

        <div class="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-2xl shadow-xl text-white">
          <div class="text-orange-100 text-sm font-medium mb-2">ยอดใช้จ่ายรวม</div>
          <div class="text-3xl font-bold">฿{{ customerStats.totalSpent.toLocaleString() }}</div>
          <div class="text-orange-100 text-xs mt-1">บาท</div>
        </div>
      </div>

      <!-- Rental History -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <!-- Header with Filter -->
        <div class="p-6 border-b bg-gradient-to-r from-slate-50 to-gray-50">
          <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <h3 class="text-xl font-bold text-gray-800">ประวัติการเช่า</h3>

            <!-- Status Filter -->
            <div class="flex gap-2">
              <button
                @click="filterStatus = 'ALL'"
                :class="filterStatus === 'ALL' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'"
                class="px-4 py-2 rounded-lg font-medium text-sm transition-all hover:shadow-md"
              >
                ทั้งหมด
              </button>
              <button
                @click="filterStatus = 'ACTIVE'"
                :class="filterStatus === 'ACTIVE' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'"
                class="px-4 py-2 rounded-lg font-medium text-sm transition-all hover:shadow-md"
              >
                กำลังเช่า
              </button>
              <button
                @click="filterStatus = 'COMPLETED'"
                :class="filterStatus === 'COMPLETED' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'"
                class="px-4 py-2 rounded-lg font-medium text-sm transition-all hover:shadow-md"
              >
                เสร็จสิ้น
              </button>
              <button
                @click="filterStatus = 'CANCELLED'"
                :class="filterStatus === 'CANCELLED' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'"
                class="px-4 py-2 rounded-lg font-medium text-sm transition-all hover:shadow-md"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>

        <!-- Rental List -->
        <div v-if="filteredRentals.length === 0" class="p-20 text-center">
          <div class="text-gray-400 text-lg">ไม่พบประวัติการเช่า</div>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 text-gray-700 text-sm font-semibold">
              <tr>
                <th class="p-4 text-left">Ref</th>
                <th class="p-4 text-left">สินค้า</th>
                <th class="p-4 text-left">วันที่เช่า</th>
                <th class="p-4 text-left">วันที่คืน</th>
                <th class="p-4 text-right">ราคา</th>
                <th class="p-4 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="rental in filteredRentals"
                :key="rental.id"
                class="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all"
              >
                <td class="p-4 font-mono text-sm text-gray-500">{{ rental.rentalRef }}</td>
                <td class="p-4">
                  <div class="flex items-center gap-3">
                    <img
                      v-if="rental.product?.images?.[0]"
                      :src="rental.product.images[0]"
                      :alt="rental.product.name"
                      class="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <div class="font-semibold text-gray-800">{{ rental.product?.name || 'N/A' }}</div>
                      <div class="text-xs text-gray-400">{{ rental.branch?.name || '-' }}</div>
                    </div>
                  </div>
                </td>
                <td class="p-4 text-sm text-gray-600">{{ formatDate(rental.startDate) }}</td>
                <td class="p-4 text-sm text-gray-600">{{ formatDate(rental.endDate) }}</td>
                <td class="p-4 text-right font-bold text-gray-800">{{ formatCurrency(rental.totalPrice) }}</td>
                <td class="p-4 text-center">
                  <span
                    class="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                    :class="statusColors[rental.status]"
                  >
                    {{ rental.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
