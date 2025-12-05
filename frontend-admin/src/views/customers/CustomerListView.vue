<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/utils/axios'

const customers = ref([])
const isLoading = ref(false)
const selectedCustomer = ref(null)
const showModal = ref(false)
const searchQuery = ref('')

onMounted(() => {
  fetchCustomers()
})

const fetchCustomers = async () => {
  isLoading.value = true
  try {
    const response = await api.get('/customers')
    customers.value = response.data
  } catch (error) {
    console.error('Failed to fetch customers:', error)
    alert('ไม่สามารถโหลดข้อมูลลูกค้าได้')
  } finally {
    isLoading.value = false
  }
}

const fetchCustomerDetail = async (id) => {
  try {
    const response = await api.get(`/customers/${id}`)
    selectedCustomer.value = response.data
    showModal.value = true
  } catch (error) {
    console.error('Failed to fetch customer detail:', error)
    alert('ไม่สามารถโหลดรายละเอียดลูกค้าได้')
  }
}

// Filter customers based on search query
const filteredCustomers = computed(() => {
  if (!searchQuery.value) return customers.value

  const query = searchQuery.value.toLowerCase()
  return customers.value.filter(customer => {
    return (
      customer.displayName?.toLowerCase().includes(query) ||
      customer.firstName?.toLowerCase().includes(query) ||
      customer.lastName?.toLowerCase().includes(query) ||
      customer.phoneNumber?.includes(query) ||
      customer.lineUserId?.toLowerCase().includes(query)
    )
  })
})

// Format date
const formatDate = (date) => {
  return new Date(date).toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Format date short
const formatDateShort = (date) => {
  return new Date(date).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Status config
const statusConfig = {
  PENDING_PAYMENT: { label: 'รอชำระเงิน', color: 'bg-yellow-100 text-yellow-800' },
  WAITING_CONFIRMATION: { label: 'รอตรวจสอบ', color: 'bg-orange-100 text-orange-800' },
  APPROVED: { label: 'อนุมัติแล้ว', color: 'bg-green-100 text-green-800' },
  WAITING_DELIVERY: { label: 'รอรับของ', color: 'bg-blue-100 text-blue-800' },
  IN_USE: { label: 'กำลังเช่า', color: 'bg-purple-100 text-purple-800' },
  RETURNED: { label: 'คืนแล้ว', color: 'bg-gray-100 text-gray-800' },
  CANCELLED: { label: 'ยกเลิก', color: 'bg-red-100 text-red-800' },
  REJECTED: { label: 'ไม่อนุมัติ', color: 'bg-red-100 text-red-800' },
}

// Get image URL
const getImageUrl = (path) => {
  if (!path) return ''
  const cleanPath = path.startsWith('/') ? path.substring(1) : path
  return `${import.meta.env.VITE_API_URL || 'https://api.fortestonlyme.online'}/${cleanPath}`
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-800">ลูกค้าทั้งหมด (Customers)</h2>
      <div class="text-sm text-gray-500">
        ทั้งหมด <span class="font-bold text-gray-800">{{ filteredCustomers.length }}</span> คน
      </div>
    </div>

    <!-- Search Bar -->
    <div class="mb-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="ค้นหาด้วยชื่อ, เบอร์โทร, LINE User ID..."
        class="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredCustomers.length === 0" class="bg-white rounded-xl shadow-sm border p-12 text-center">
      <div class="text-6xl mb-4">👥</div>
      <h3 class="text-xl font-bold text-gray-800 mb-2">
        {{ searchQuery ? 'ไม่พบลูกค้าที่ตรงกับการค้นหา' : 'ยังไม่มีลูกค้า' }}
      </h3>
      <p class="text-gray-500">
        {{ searchQuery ? 'ลองค้นหาด้วยคำอื่น' : 'ลูกค้าจะปรากฏเมื่อมีการจองผ่าน LIFF' }}
      </p>
    </div>

    <!-- Customer Table -->
    <div v-else class="bg-white rounded-xl shadow-sm border overflow-hidden">
      <table class="w-full text-left">
        <thead class="bg-gray-50 text-gray-600 text-sm uppercase">
          <tr>
            <th class="p-4">ลูกค้า</th>
            <th class="p-4">ข้อมูลติดต่อ</th>
            <th class="p-4 text-center">จำนวนการเช่า</th>
            <th class="p-4 text-center">กำลังเช่า</th>
            <th class="p-4 text-right">ยอดใช้จ่ายรวม</th>
            <th class="p-4 text-center">วันที่สมัคร</th>
            <th class="p-4 text-right">จัดการ</th>
          </tr>
        </thead>
        <tbody class="text-sm">
          <tr
            v-for="customer in filteredCustomers"
            :key="customer.id"
            class="border-t hover:bg-gray-50 transition-colors"
          >
            <!-- Customer Info -->
            <td class="p-4">
              <div class="flex items-center gap-3">
                <img
                  v-if="customer.pictureUrl"
                  :src="customer.pictureUrl"
                  alt="Profile"
                  class="w-10 h-10 rounded-full border-2 border-blue-500"
                />
                <div
                  v-else
                  class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm"
                >
                  {{ customer.displayName?.charAt(0) || 'U' }}
                </div>
                <div>
                  <p class="font-semibold text-gray-900">{{ customer.displayName || 'ไม่ระบุชื่อ' }}</p>
                  <p class="text-xs text-gray-500 font-mono">{{ customer.lineUserId }}</p>
                </div>
              </div>
            </td>

            <!-- Contact Info -->
            <td class="p-4">
              <div v-if="customer.firstName || customer.lastName || customer.phoneNumber">
                <p class="font-medium text-gray-800">
                  {{ customer.firstName }} {{ customer.lastName }}
                </p>
                <p class="text-xs text-gray-500">{{ customer.phoneNumber }}</p>
              </div>
              <p v-else class="text-gray-400 text-xs">ยังไม่ได้กรอกข้อมูล</p>
            </td>

            <!-- Total Rentals -->
            <td class="p-4 text-center">
              <span class="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full font-bold text-sm">
                {{ customer.statistics.totalRentals }}
              </span>
            </td>

            <!-- Active Rentals -->
            <td class="p-4 text-center">
              <span
                v-if="customer.statistics.activeRentals > 0"
                class="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-800 rounded-full font-bold text-sm"
              >
                {{ customer.statistics.activeRentals }}
              </span>
              <span v-else class="text-gray-400">-</span>
            </td>

            <!-- Total Spent -->
            <td class="p-4 text-right">
              <span class="font-bold text-green-600">
                ฿{{ customer.statistics.totalSpent.toLocaleString() }}
              </span>
            </td>

            <!-- Created Date -->
            <td class="p-4 text-center text-xs text-gray-500">
              {{ formatDateShort(customer.createdAt) }}
            </td>

            <!-- Actions -->
            <td class="p-4 text-right">
              <button
                @click="fetchCustomerDetail(customer.id)"
                class="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
              >
                ดูรายละเอียด
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Customer Detail Modal -->
    <div
      v-if="showModal && selectedCustomer"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showModal = false"
    >
      <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <img
                v-if="selectedCustomer.pictureUrl"
                :src="selectedCustomer.pictureUrl"
                alt="Profile"
                class="w-16 h-16 rounded-full border-4 border-white shadow-lg"
              />
              <div
                v-else
                class="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-2xl shadow-lg"
              >
                {{ selectedCustomer.displayName?.charAt(0) || 'U' }}
              </div>
              <div>
                <h3 class="text-2xl font-bold">{{ selectedCustomer.displayName || 'ไม่ระบุชื่อ' }}</h3>
                <p class="text-blue-100 text-sm font-mono">{{ selectedCustomer.lineUserId }}</p>
              </div>
            </div>
            <button
              @click="showModal = false"
              class="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="p-6 space-y-6">
          <!-- Statistics Cards -->
          <div class="grid grid-cols-4 gap-4">
            <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <div class="text-3xl font-bold text-blue-600">{{ selectedCustomer.statistics.totalRentals }}</div>
              <div class="text-xs text-gray-600 mt-1">ทั้งหมด</div>
            </div>
            <div class="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
              <div class="text-3xl font-bold text-purple-600">{{ selectedCustomer.statistics.activeRentals }}</div>
              <div class="text-xs text-gray-600 mt-1">กำลังเช่า</div>
            </div>
            <div class="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <div class="text-3xl font-bold text-green-600">{{ selectedCustomer.statistics.completedRentals }}</div>
              <div class="text-xs text-gray-600 mt-1">เสร็จแล้ว</div>
            </div>
            <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-center text-white">
              <div class="text-2xl font-bold">฿{{ selectedCustomer.statistics.totalSpent.toLocaleString() }}</div>
              <div class="text-xs opacity-90 mt-1">ยอดใช้จ่ายรวม</div>
            </div>
          </div>

          <!-- Customer Info -->
          <div class="bg-gray-50 rounded-xl p-4 border">
            <h4 class="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span>👤</span> ข้อมูลส่วนตัว
            </h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-gray-500 text-xs mb-1">ชื่อ-นามสกุล</p>
                <p class="font-medium text-gray-900">
                  {{ selectedCustomer.firstName || '-' }} {{ selectedCustomer.lastName || '' }}
                </p>
              </div>
              <div>
                <p class="text-gray-500 text-xs mb-1">เบอร์โทรศัพท์</p>
                <p class="font-medium text-gray-900">{{ selectedCustomer.phoneNumber || '-' }}</p>
              </div>
              <div>
                <p class="text-gray-500 text-xs mb-1">วันที่สมัคร</p>
                <p class="font-medium text-gray-900">{{ formatDate(selectedCustomer.createdAt) }}</p>
              </div>
              <div>
                <p class="text-gray-500 text-xs mb-1">อัปเดตล่าสุด</p>
                <p class="font-medium text-gray-900">{{ formatDate(selectedCustomer.updatedAt) }}</p>
              </div>
            </div>
          </div>

          <!-- Rental History -->
          <div>
            <h4 class="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span>📋</span> ประวัติการเช่า ({{ selectedCustomer.rentals.length }} รายการ)
            </h4>

            <div v-if="selectedCustomer.rentals.length === 0" class="text-center py-8 text-gray-400">
              ยังไม่มีประวัติการเช่า
            </div>

            <div v-else class="space-y-3 max-h-96 overflow-y-auto">
              <div
                v-for="rental in selectedCustomer.rentals"
                :key="rental.id"
                class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div class="flex items-start justify-between mb-3">
                  <div>
                    <p class="font-semibold text-gray-900">{{ rental.product.name }}</p>
                    <p class="text-xs text-gray-500 font-mono">{{ rental.rentalRef }}</p>
                  </div>
                  <span
                    class="px-3 py-1 rounded-full text-xs font-semibold"
                    :class="statusConfig[rental.status]?.color"
                  >
                    {{ statusConfig[rental.status]?.label }}
                  </span>
                </div>

                <div class="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <p class="text-gray-500 mb-1">วันที่เช่า</p>
                    <p class="font-medium text-gray-900">
                      {{ formatDateShort(rental.startDate) }} - {{ formatDateShort(rental.endDate) }}
                    </p>
                  </div>
                  <div>
                    <p class="text-gray-500 mb-1">สาขา</p>
                    <p class="font-medium text-gray-900">{{ rental.branch.name }}</p>
                  </div>
                  <div>
                    <p class="text-gray-500 mb-1">ยอดเงิน</p>
                    <p class="font-bold text-blue-600">฿{{ rental.totalPrice.toLocaleString() }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
