<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { dashboardService } from '@/services/dashboard.service'
import { useToast } from '@/composables/useToast'
import Skeleton from '@/components/Skeleton.vue'

const authStore = useAuthStore()
const toast = useToast()

// State
const isLoading = ref(true)
const stats = ref({
  todayOrders: 0,
  totalProducts: 0,
  totalBranches: 0,
  activeRentals: 0,
  monthRevenue: 0,
  todayRevenue: 0,
  pendingApprovals: 0
})
const recentOrders = ref([])
const topProducts = ref([])
const revenueData = ref([])

// Status colors
const statusColors = {
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
  WAITING_CONFIRMATION: 'bg-orange-100 text-orange-800',
  APPROVED: 'bg-green-100 text-green-800',
  IN_USE: 'bg-purple-100 text-purple-800',
  RETURNED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800'
}

onMounted(async () => {
  await fetchDashboardData()
})

const fetchDashboardData = async () => {
  isLoading.value = true
  try {
    // Fetch all dashboard data
    const [statsData, ordersData, productsData] = await Promise.all([
      dashboardService.getStats(),
      dashboardService.getRecentOrders(5),
      dashboardService.getTopProducts(5)
    ])

    stats.value = statsData
    recentOrders.value = ordersData
    topProducts.value = productsData

    // Generate simple revenue chart data (last 7 days)
    revenueData.value = generateRevenueData()
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    toast.error('ไม่สามารถโหลดข้อมูล Dashboard ได้')
  } finally {
    isLoading.value = false
  }
}

// สร้างข้อมูลกราฟรายได้แบบง่าย (7 วันที่ผ่านมา)
const generateRevenueData = () => {
  const data = []
  const days = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์', 'อาทิตย์']
  for (let i = 0; i < 7; i++) {
    data.push({
      day: days[i],
      amount: Math.floor(Math.random() * 50000) + 10000
    })
  }
  return data
}

// คำนวณความสูงของแท่งกราฟ
const getBarHeight = (amount) => {
  const max = Math.max(...revenueData.value.map(d => d.amount))
  return `${(amount / max) * 100}%`
}

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB'
  }).format(amount)
}

// Format date
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <!-- Header -->
    <div class="mb-8">
      <h2 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Dashboard
      </h2>
      <p class="text-gray-500 mt-2">
        ยินดีต้อนรับกลับมา,
        <span class="font-semibold text-blue-600">{{ authStore.user?.fullName }}</span> 👋
      </p>
    </div>

    <!-- Stats Cards -->
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Skeleton type="stat-card" v-for="i in 4" :key="i" />
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Today's Orders -->
      <div class="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 text-white">
        <div class="flex items-center justify-between mb-3">
          <div class="text-blue-100 text-sm font-medium">ออร์เดอร์วันนี้</div>
          <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>
        <div class="text-4xl font-bold mb-1">{{ stats.todayOrders }}</div>
        <div class="text-blue-100 text-xs">รายการ</div>
      </div>

      <!-- Total Products -->
      <div class="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 text-white">
        <div class="flex items-center justify-between mb-3">
          <div class="text-purple-100 text-sm font-medium">สินค้าทั้งหมด</div>
          <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>
        <div class="text-4xl font-bold mb-1">{{ stats.totalProducts }}</div>
        <div class="text-purple-100 text-xs">ชิ้น</div>
      </div>

      <!-- Active Branches -->
      <div class="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 text-white">
        <div class="flex items-center justify-between mb-3">
          <div class="text-emerald-100 text-sm font-medium">สาขาที่เปิดใช้งาน</div>
          <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>
        <div class="text-4xl font-bold mb-1">{{ stats.totalBranches }}</div>
        <div class="text-emerald-100 text-xs">สาขา</div>
      </div>

      <!-- Month Revenue -->
      <div class="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 text-white">
        <div class="flex items-center justify-between mb-3">
          <div class="text-orange-100 text-sm font-medium">รายได้เดือนนี้</div>
          <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div class="text-3xl font-bold mb-1">฿{{ stats.monthRevenue?.toLocaleString() || 0 }}</div>
        <div class="text-orange-100 text-xs">บาท</div>
      </div>
    </div>

    <!-- Charts & Tables Row -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <!-- Revenue Chart -->
      <div class="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <h3 class="text-lg font-bold text-gray-800 mb-6">รายได้ 7 วันที่ผ่านมา</h3>

        <div v-if="isLoading" class="h-64 flex items-center justify-center">
          <Skeleton type="text" :count="3" />
        </div>

        <div v-else class="h-64 flex items-end justify-between gap-3">
          <div
            v-for="(data, index) in revenueData"
            :key="index"
            class="flex-1 flex flex-col items-center group"
          >
            <div class="relative w-full">
              <div
                class="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-300 group-hover:from-purple-500 group-hover:to-purple-400 cursor-pointer"
                :style="{ height: getBarHeight(data.amount) }"
              >
                <div class="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {{ formatCurrency(data.amount) }}
                </div>
              </div>
            </div>
            <div class="text-xs text-gray-500 mt-3 font-medium">{{ data.day }}</div>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <h3 class="text-lg font-bold text-gray-800 mb-6">สถิติด่วน</h3>

        <div v-if="isLoading" class="space-y-4">
          <Skeleton type="text" :count="4" />
        </div>

        <div v-else class="space-y-4">
          <div class="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
            <span class="text-sm text-gray-600">การเช่าที่ใช้งานอยู่</span>
            <span class="text-xl font-bold text-blue-600">{{ stats.activeRentals }}</span>
          </div>
          <div class="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
            <span class="text-sm text-gray-600">รอการอนุมัติ</span>
            <span class="text-xl font-bold text-orange-600">{{ stats.pendingApprovals }}</span>
          </div>
          <div class="flex items-center justify-between p-3 bg-green-50 rounded-xl">
            <span class="text-sm text-gray-600">รายได้วันนี้</span>
            <span class="text-xl font-bold text-green-600">฿{{ stats.todayRevenue?.toLocaleString() || 0 }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Orders & Top Products -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Orders -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div class="p-6 border-b bg-gradient-to-r from-slate-50 to-gray-50">
          <h3 class="text-lg font-bold text-gray-800">รายการเช่าล่าสุด</h3>
        </div>

        <div v-if="isLoading" class="p-6">
          <Skeleton type="table" :count="5" />
        </div>

        <div v-else-if="recentOrders.length === 0" class="p-12 text-center text-gray-400">
          ไม่มีรายการเช่า
        </div>

        <div v-else class="divide-y divide-gray-100">
          <div
            v-for="order in recentOrders"
            :key="order.id"
            class="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="font-semibold text-gray-800">{{ order.product?.name || 'N/A' }}</div>
                <div class="text-sm text-gray-500 mt-1">
                  {{ order.customer?.firstName }} {{ order.customer?.lastName }}
                </div>
                <div class="text-xs text-gray-400 mt-1">{{ formatDate(order.createdAt) }}</div>
              </div>
              <div class="text-right">
                <div class="font-bold text-gray-800">฿{{ order.totalPrice?.toLocaleString() }}</div>
                <span
                  class="inline-block mt-2 px-2 py-1 text-xs font-semibold rounded-full"
                  :class="statusColors[order.status]"
                >
                  {{ order.status }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Products -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div class="p-6 border-b bg-gradient-to-r from-slate-50 to-gray-50">
          <h3 class="text-lg font-bold text-gray-800">สินค้ายอดนิยม</h3>
        </div>

        <div v-if="isLoading" class="p-6">
          <Skeleton type="table" :count="5" />
        </div>

        <div v-else-if="topProducts.length === 0" class="p-12 text-center text-gray-400">
          ไม่มีข้อมูลสินค้า
        </div>

        <div v-else class="divide-y divide-gray-100">
          <div
            v-for="(product, index) in topProducts"
            :key="product.id"
            class="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div class="flex items-center gap-4">
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                {{ index + 1 }}
              </div>
              <img
                v-if="product.images?.[0]"
                :src="product.images[0]"
                :alt="product.name"
                class="w-12 h-12 rounded-lg object-cover"
              />
              <div class="flex-1">
                <div class="font-semibold text-gray-800">{{ product.name }}</div>
                <div class="text-sm text-gray-500">{{ product.rentalCount || 0 }} ครั้ง</div>
              </div>
              <div class="text-right">
                <div class="font-bold text-blue-600">฿{{ product.pricePerDay?.toLocaleString() }}</div>
                <div class="text-xs text-gray-400">/วัน</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
