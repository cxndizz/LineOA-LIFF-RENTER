<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axios from '@/utils/axios'

const authStore = useAuthStore()

const stats = ref(null)
const isLoading = ref(true)
const error = ref(null)

const fetchDashboardStats = async () => {
  isLoading.value = true
  error.value = null
  try {
    const response = await axios.get('/analytics/dashboard')
    stats.value = response.data
  } catch (err) {
    console.error('Failed to fetch dashboard stats:', err)
    error.value = 'ไม่สามารถโหลดข้อมูลได้'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchDashboardStats()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h2 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
        Dashboard
      </h2>
      <p class="text-gray-500 mt-2">
        Welcome back, <span class="font-semibold text-blue-600">{{ authStore.user?.fullName }}</span> 👋
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-500">กำลังโหลดข้อมูล...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <p class="text-red-600 mb-4">{{ error }}</p>
      <button @click="fetchDashboardStats" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
        ลองใหม่อีกครั้ง
      </button>
    </div>

    <!-- Dashboard Content -->
    <div v-else-if="stats">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Today's Orders -->
        <div class="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg text-white">
          <div class="flex items-center justify-between mb-2">
            <div class="text-blue-100 text-sm font-medium">วันนี้</div>
            <div class="text-3xl">📋</div>
          </div>
          <div class="text-3xl font-bold mb-1">{{ stats.summary.todayOrders }}</div>
          <div class="text-blue-100 text-sm">คำสั่งจองใหม่</div>
        </div>

        <!-- Total Products -->
        <div class="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-lg text-white">
          <div class="flex items-center justify-between mb-2">
            <div class="text-purple-100 text-sm font-medium">สินค้า</div>
            <div class="text-3xl">📦</div>
          </div>
          <div class="text-3xl font-bold mb-1">{{ stats.summary.totalProducts }}</div>
          <div class="text-purple-100 text-sm">สินค้าทั้งหมด</div>
        </div>

        <!-- Active Rentals -->
        <div class="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl shadow-lg text-white">
          <div class="flex items-center justify-between mb-2">
            <div class="text-orange-100 text-sm font-medium">กำลังเช่า</div>
            <div class="text-3xl">🚀</div>
          </div>
          <div class="text-3xl font-bold mb-1">{{ stats.summary.activeRentals }}</div>
          <div class="text-orange-100 text-sm">รายการที่ active</div>
        </div>

        <!-- Total Revenue -->
        <div class="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-lg text-white">
          <div class="flex items-center justify-between mb-2">
            <div class="text-green-100 text-sm font-medium">รายได้รวม</div>
            <div class="text-3xl">💰</div>
          </div>
          <div class="text-3xl font-bold mb-1">฿{{ stats.summary.totalRevenue.toLocaleString() }}</div>
          <div class="text-green-100 text-sm">จากออร์เดอร์ที่เสร็จแล้ว</div>
        </div>
      </div>

      <!-- Additional Stats -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Active Branches & Customers -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>📊</span> ภาพรวมระบบ
          </h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl">🏢</div>
                <div>
                  <p class="text-sm text-gray-500">สาขาที่เปิดให้บริการ</p>
                  <p class="text-2xl font-bold text-gray-800">{{ stats.summary.activeBranches }}</p>
                </div>
              </div>
            </div>
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-xl">👥</div>
                <div>
                  <p class="text-sm text-gray-500">ลูกค้าทั้งหมด</p>
                  <p class="text-2xl font-bold text-gray-800">{{ stats.summary.totalCustomers }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Revenue Trend Chart (Simple Bar Chart) -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>📈</span> รายได้ 7 วันล่าสุด
          </h3>
          <div class="flex items-end gap-2 h-48">
            <div
              v-for="(day, index) in stats.revenueTrend"
              :key="index"
              class="flex-1 flex flex-col items-center"
            >
              <div class="relative w-full flex items-end justify-center" style="height: 160px">
                <div
                  class="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all hover:from-blue-700 hover:to-blue-500 cursor-pointer"
                  :style="{ height: `${Math.max((day.revenue / Math.max(...stats.revenueTrend.map(d => d.revenue)) * 100), 5)}%` }"
                  :title="`฿${day.revenue.toLocaleString()}`"
                ></div>
              </div>
              <p class="text-xs text-gray-500 mt-2">{{ day.date }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Products -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>🏆</span> สินค้ายอดนิยม
        </h3>
        <div v-if="stats.topProducts.length > 0" class="space-y-3">
          <div
            v-for="(product, index) in stats.topProducts"
            :key="product.id"
            class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div class="flex items-center gap-4">
              <div class="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {{ index + 1 }}
              </div>
              <div>
                <p class="font-semibold text-gray-800">{{ product.name }}</p>
                <p class="text-sm text-gray-500">{{ product.branchName }} · ฿{{ product.pricePerDay }}/วัน</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-2xl font-bold text-blue-600">{{ product.rentalCount }}</p>
              <p class="text-xs text-gray-500">ครั้ง</p>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-8 text-gray-400">
          ยังไม่มีข้อมูล
        </div>
      </div>

      <!-- Recent Orders -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>🕐</span> ออร์เดอร์ล่าสุด
        </h3>
        <div v-if="stats.recentOrders.length > 0" class="space-y-3">
          <div
            v-for="order in stats.recentOrders"
            :key="order.id"
            class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div>
              <p class="font-semibold text-gray-800">{{ order.productName }}</p>
              <p class="text-sm text-gray-500">{{ order.customerName }} · {{ order.rentalRef }}</p>
            </div>
            <div class="text-right">
              <p class="font-bold text-gray-800">฿{{ order.totalPrice.toLocaleString() }}</p>
              <span class="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                :class="{
                  'bg-yellow-100 text-yellow-800': order.status === 'PENDING_PAYMENT',
                  'bg-orange-100 text-orange-800': order.status === 'WAITING_CONFIRMATION',
                  'bg-green-100 text-green-800': order.status === 'APPROVED',
                  'bg-blue-100 text-blue-800': order.status === 'IN_USE',
                  'bg-gray-100 text-gray-800': order.status === 'RETURNED'
                }"
              >
                {{ order.status }}
              </span>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-8 text-gray-400">
          ยังไม่มีออร์เดอร์
        </div>
      </div>
    </div>
  </div>
</template>