<script setup>
import { ref, onMounted, computed } from 'vue'
import { rentalService } from '@/services/rental.service'
import { useToast } from '@/composables/useToast'
import Skeleton from '@/components/Skeleton.vue'

const toast = useToast()

// State
const orders = ref([])
const isLoading = ref(false)
const selectedOrder = ref(null)
const showModal = ref(false)
const actionNote = ref('')
const searchQuery = ref('')
const filterStatus = ref('ALL')
const filterDateFrom = ref('')
const filterDateTo = ref('')

const statusColors = {
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  WAITING_CONFIRMATION: 'bg-orange-100 text-orange-800 border border-orange-200',
  APPROVED: 'bg-green-100 text-green-800 border border-green-200',
  WAITING_DELIVERY: 'bg-blue-100 text-blue-800 border border-blue-200',
  IN_USE: 'bg-purple-100 text-purple-800 border border-purple-200',
  RETURNED: 'bg-gray-100 text-gray-800 border border-gray-200',
  CANCELLED: 'bg-red-100 text-red-800 border border-red-200',
  REJECTED: 'bg-red-100 text-red-800 border border-red-200'
}

onMounted(() => {
  fetchOrders()
})

const fetchOrders = async () => {
  isLoading.value = true
  try {
    orders.value = await rentalService.getAll()
  } catch (error) {
    console.error(error)
    toast.error('ไม่สามารถโหลดข้อมูลออร์เดอร์ได้')
  } finally {
    isLoading.value = false
  }
}

// ฟิลเตอร์ออร์เดอร์
const filteredOrders = computed(() => {
  let result = orders.value

  // Filter by status
  if (filterStatus.value !== 'ALL') {
    result = result.filter(order => order.status === filterStatus.value)
  }

  // Filter by search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(order => {
      const ref = order.rentalRef?.toLowerCase() || ''
      const customer = `${order.customer?.firstName} ${order.customer?.lastName}`.toLowerCase()
      const product = order.product?.name?.toLowerCase() || ''
      return ref.includes(query) || customer.includes(query) || product.includes(query)
    })
  }

  // Filter by date range
  if (filterDateFrom.value) {
    result = result.filter(order => new Date(order.startDate) >= new Date(filterDateFrom.value))
  }
  if (filterDateTo.value) {
    result = result.filter(order => new Date(order.startDate) <= new Date(filterDateTo.value))
  }

  return result
})

// สถิติ
const orderStats = computed(() => {
  return {
    total: orders.value.length,
    pending: orders.value.filter(o => o.status === 'WAITING_CONFIRMATION').length,
    active: orders.value.filter(o => o.status === 'IN_USE').length,
    completed: orders.value.filter(o => o.status === 'RETURNED').length
  }
})

const openModal = (order) => {
  selectedOrder.value = order
  actionNote.value = ''
  showModal.value = true
}

const updateStatus = async (status) => {
  try {
    await rentalService.updateStatus(selectedOrder.value.id, status, actionNote.value)
    showModal.value = false
    toast.success(`เปลี่ยนสถานะเป็น ${status} เรียบร้อยแล้ว`)
    fetchOrders()
  } catch (error) {
    toast.error('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ')
  }
}

// Export to CSV
const exportToCSV = () => {
  const headers = ['Ref', 'ลูกค้า', 'สินค้า', 'วันที่เช่า', 'วันที่คืน', 'ราคา', 'สถานะ']
  const rows = filteredOrders.value.map(order => [
    order.rentalRef,
    `${order.customer?.firstName} ${order.customer?.lastName}`,
    order.product?.name,
    new Date(order.startDate).toLocaleDateString('th-TH'),
    new Date(order.endDate).toLocaleDateString('th-TH'),
    order.totalPrice,
    order.status
  ])

  const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `orders_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  toast.success('ส่งออกข้อมูลเรียบร้อยแล้ว')
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const clearFilters = () => {
  searchQuery.value = ''
  filterStatus.value = 'ALL'
  filterDateFrom.value = ''
  filterDateTo.value = ''
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <!-- Header -->
    <div class="mb-8">
      <h2 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        จัดการรายการเช่า
      </h2>
      <p class="text-gray-500 mt-2">ตรวจสอบ อนุมัติ และจัดการออร์เดอร์ทั้งหมด</p>
    </div>

    <!-- Stats Cards -->
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Skeleton type="stat-card" v-for="i in 4" :key="i" />
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-xl text-white">
        <div class="text-blue-100 text-sm font-medium mb-2">ทั้งหมด</div>
        <div class="text-4xl font-bold">{{ orderStats.total }}</div>
        <div class="text-blue-100 text-xs mt-1">รายการ</div>
      </div>

      <div class="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl shadow-xl text-white">
        <div class="text-orange-100 text-sm font-medium mb-2">รอการอนุมัติ</div>
        <div class="text-4xl font-bold">{{ orderStats.pending }}</div>
        <div class="text-orange-100 text-xs mt-1">รายการ</div>
      </div>

      <div class="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-xl text-white">
        <div class="text-purple-100 text-sm font-medium mb-2">กำลังเช่าอยู่</div>
        <div class="text-4xl font-bold">{{ orderStats.active }}</div>
        <div class="text-purple-100 text-xs mt-1">รายการ</div>
      </div>

      <div class="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-2xl shadow-xl text-white">
        <div class="text-emerald-100 text-sm font-medium mb-2">เสร็จสิ้นแล้ว</div>
        <div class="text-4xl font-bold">{{ orderStats.completed }}</div>
        <div class="text-emerald-100 text-xs mt-1">รายการ</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-6">
      <div class="flex flex-col lg:flex-row gap-4">
        <!-- Search -->
        <div class="flex-1 relative">
          <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ค้นหา Ref, ชื่อลูกค้า, สินค้า..."
            class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <!-- Status Filter -->
        <select
          v-model="filterStatus"
          class="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
        >
          <option value="ALL">สถานะทั้งหมด</option>
          <option value="WAITING_CONFIRMATION">รอการอนุมัติ</option>
          <option value="APPROVED">อนุมัติแล้ว</option>
          <option value="IN_USE">กำลังเช่าอยู่</option>
          <option value="RETURNED">คืนแล้ว</option>
          <option value="CANCELLED">ยกเลิก</option>
        </select>

        <!-- Date From -->
        <input
          v-model="filterDateFrom"
          type="date"
          class="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />

        <!-- Date To -->
        <input
          v-model="filterDateTo"
          type="date"
          class="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />

        <!-- Buttons -->
        <button
          @click="clearFilters"
          class="px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-medium"
        >
          ล้างตัวกรอง
        </button>

        <button
          @click="exportToCSV"
          class="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all font-medium flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
      </div>
    </div>

    <!-- Orders Table -->
    <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div v-if="isLoading" class="p-6">
        <Skeleton type="table" :count="10" />
      </div>

      <div v-else-if="filteredOrders.length === 0" class="p-20 text-center">
        <div class="text-gray-400 text-lg mb-2">ไม่พบรายการเช่า</div>
        <div class="text-gray-400 text-sm">ลองเปลี่ยนตัวกรอง</div>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-gradient-to-r from-slate-100 to-gray-100 text-gray-700 text-sm font-semibold">
            <tr>
              <th class="p-4">Ref</th>
              <th class="p-4">ลูกค้า</th>
              <th class="p-4">สินค้า</th>
              <th class="p-4">วันที่เช่า</th>
              <th class="p-4">ยอดเงิน</th>
              <th class="p-4">สถานะ</th>
              <th class="p-4 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="order in filteredOrders" :key="order.id" class="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all">
              <td class="p-4 font-mono text-sm text-gray-500">{{ order.rentalRef }}</td>
              <td class="p-4">
                <div class="font-medium text-gray-800">{{ order.customer?.firstName }} {{ order.customer?.lastName }}</div>
                <div class="text-xs text-gray-400">{{ order.customer?.phoneNumber }}</div>
              </td>
              <td class="p-4">
                <div class="flex items-center gap-3">
                  <img
                    v-if="order.product?.images?.[0]"
                    :src="order.product.images[0]"
                    :alt="order.product.name"
                    class="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <div class="font-medium text-gray-800">{{ order.product?.name }}</div>
                    <div class="text-xs text-gray-400">{{ order.branch?.name }}</div>
                  </div>
                </div>
              </td>
              <td class="p-4 text-sm text-gray-600">
                {{ formatDate(order.startDate) }} - {{ formatDate(order.endDate) }}
              </td>
              <td class="p-4 font-bold text-gray-800">฿{{ order.totalPrice?.toLocaleString() }}</td>
              <td class="p-4">
                <span class="px-3 py-1 rounded-full text-xs font-semibold" :class="statusColors[order.status]">
                  {{ order.status }}
                </span>
              </td>
              <td class="p-4 text-center">
                <button
                  @click="openModal(order)"
                  class="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all font-medium text-sm"
                >
                  ตรวจสอบ
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Order Detail Modal -->
    <div v-if="showModal && selectedOrder" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="showModal = false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-t-2xl">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="text-2xl font-bold">รายละเอียดคำสั่งเช่า</h3>
              <p class="text-blue-100 text-sm mt-1">#{{ selectedOrder.rentalRef }}</p>
            </div>
            <button @click="showModal = false" class="w-10 h-10 rounded-full hover:bg-white/20 flex items-center justify-center transition-all">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div class="p-6 space-y-6">
          <!-- Customer & Product Info -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Customer Info -->
            <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl">
              <h4 class="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                ข้อมูลลูกค้า
              </h4>
              <div class="space-y-2 text-sm">
                <div><span class="text-gray-600">ชื่อ:</span> <span class="font-medium">{{ selectedOrder.customer?.firstName }} {{ selectedOrder.customer?.lastName }}</span></div>
                <div><span class="text-gray-600">โทร:</span> <span class="font-medium">{{ selectedOrder.customer?.phoneNumber }}</span></div>
                <div><span class="text-gray-600">LINE:</span> <span class="font-medium">{{ selectedOrder.customer?.lineDisplayName || '-' }}</span></div>
                <div><span class="text-gray-600">ที่อยู่จัดส่ง:</span> <span class="font-medium">{{ selectedOrder.customPickupAddress || '-' }}</span></div>
              </div>
            </div>

            <!-- Rental Info -->
            <div class="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl">
              <h4 class="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                ข้อมูลการเช่า
              </h4>
              <div class="space-y-2 text-sm">
                <div><span class="text-gray-600">สินค้า:</span> <span class="font-medium">{{ selectedOrder.product?.name }}</span></div>
                <div><span class="text-gray-600">สาขา:</span> <span class="font-medium">{{ selectedOrder.branch?.name }}</span></div>
                <div><span class="text-gray-600">ระยะเวลา:</span> <span class="font-medium">{{ formatDate(selectedOrder.startDate) }} - {{ formatDate(selectedOrder.endDate) }}</span></div>
                <div><span class="text-gray-600">ราคา:</span> <span class="font-bold text-lg text-purple-700">฿{{ selectedOrder.totalPrice?.toLocaleString() }}</span></div>
                <div><span class="text-gray-600">มัดจำ:</span> <span class="font-medium">฿{{ selectedOrder.depositAmount?.toLocaleString() }}</span></div>
              </div>
            </div>
          </div>

          <!-- Payment Slip -->
          <div v-if="selectedOrder.payment" class="bg-gradient-to-br from-green-50 to-emerald-100 p-5 rounded-xl">
            <h4 class="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              ข้อมูลการชำระเงิน
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Payment Details -->
              <div class="space-y-2 text-sm">
                <div><span class="text-gray-600">ธนาคาร:</span> <span class="font-medium">{{ selectedOrder.payment.bankName || '-' }}</span></div>
                <div><span class="text-gray-600">จำนวนเงิน:</span> <span class="font-bold text-green-700">฿{{ selectedOrder.payment.amount?.toLocaleString() }}</span></div>
                <div><span class="text-gray-600">วันที่โอน:</span> <span class="font-medium">{{ formatDateTime(selectedOrder.payment.transferDate) }}</span></div>
                <div><span class="text-gray-600">หมายเหตุ:</span> <span class="font-medium">{{ selectedOrder.payment.note || '-' }}</span></div>
              </div>

              <!-- Payment Slip Image -->
              <div v-if="selectedOrder.payment.slipUrl">
                <div class="text-sm text-gray-600 mb-2">สลิปโอนเงิน:</div>
                <img
                  :src="selectedOrder.payment.slipUrl"
                  alt="Payment Slip"
                  class="w-full max-h-64 object-contain rounded-lg border-2 border-green-300 cursor-pointer hover:border-green-500 transition-all"
                  @click="window.open(selectedOrder.payment.slipUrl, '_blank')"
                />
                <div class="text-xs text-gray-500 text-center mt-2">คลิกเพื่อดูขนาดใหญ่</div>
              </div>
            </div>
          </div>

          <!-- Action Notes -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">หมายเหตุ (เหตุผลในการเปลี่ยนสถานะ)</label>
            <textarea
              v-model="actionNote"
              class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              rows="3"
              placeholder="ระบุหมายเหตุ (ถ้ามี)..."
            ></textarea>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-wrap justify-end gap-3 pt-4 border-t">
            <template v-if="selectedOrder.status === 'WAITING_CONFIRMATION'">
              <button
                @click="updateStatus('REJECTED')"
                class="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-medium shadow-lg hover:shadow-xl"
              >
                ❌ ไม่อนุมัติ
              </button>
              <button
                @click="updateStatus('APPROVED')"
                class="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all font-medium shadow-lg hover:shadow-xl"
              >
                ✓ อนุมัติการจอง
              </button>
            </template>

            <template v-else-if="selectedOrder.status === 'APPROVED'">
              <button
                @click="updateStatus('IN_USE')"
                class="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-medium shadow-lg hover:shadow-xl"
              >
                📦 ลูกค้ารับของแล้ว
              </button>
            </template>

            <template v-else-if="selectedOrder.status === 'IN_USE'">
              <button
                @click="updateStatus('RETURNED')"
                class="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all font-medium shadow-lg hover:shadow-xl"
              >
                ✓ คืนของแล้ว (จบงาน)
              </button>
            </template>

            <button
              @click="showModal = false"
              class="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-medium"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
