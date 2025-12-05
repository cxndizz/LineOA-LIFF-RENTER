<script setup>
import { ref, onMounted, computed } from 'vue'
import { rentalService } from '@/services/rental.service'

const orders = ref([])
const isLoading = ref(false)
const selectedOrder = ref(null) // ออร์เดอร์ที่กดดูรายละเอียด (Modal)
const showModal = ref(false)
const actionNote = ref('') // หมายเหตุตอนกดเปลี่ยนสถานะ

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

onMounted(() => {
  fetchOrders()
})

const fetchOrders = async () => {
  isLoading.value = true
  try {
    orders.value = await rentalService.getAll()
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const openModal = (order) => {
  selectedOrder.value = order
  actionNote.value = ''
  showModal.value = true
}

// สร้าง URL รูปภาพ (ป้องกัน double slash)
const getImageUrl = (path) => {
  if (!path) return ''
  const cleanPath = path.startsWith('/') ? path.substring(1) : path
  return `${import.meta.env.VITE_API_URL || 'https://api.fortestonlyme.online'}/${cleanPath}`
}

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

// Lightbox state
const showLightbox = ref(false)
const lightboxImage = ref('')

const openLightbox = (imageUrl) => {
  lightboxImage.value = imageUrl
  showLightbox.value = true
}

const updateStatus = async (status) => {
  if (!confirm(`ยืนยันเปลี่ยนสถานะเป็น ${status}?`)) return

  try {
    await rentalService.updateStatus(selectedOrder.value.id, status, actionNote.value)
    showModal.value = false
    fetchOrders() // โหลดข้อมูลใหม่
  } catch (error) {
    alert('เกิดข้อผิดพลาด')
  }
}

</script>

<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 mb-6">จัดการรายการเช่า (Orders)</h2>

    <div class="bg-white rounded-xl shadow-sm border overflow-hidden">
      <table class="w-full text-left">
        <thead class="bg-gray-50 text-gray-600 text-sm uppercase">
          <tr>
            <th class="p-4">Ref</th>
            <th class="p-4">ลูกค้า</th>
            <th class="p-4">สินค้า</th>
            <th class="p-4">วันที่เช่า</th>
            <th class="p-4">ยอดเงิน</th>
            <th class="p-4">สถานะ</th>
            <th class="p-4 text-right">จัดการ</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="order in orders" :key="order.id" class="hover:bg-gray-50">
            <td class="p-4 font-mono text-sm text-gray-500">{{ order.rentalRef }}</td>
            <td class="p-4">
              <div class="font-medium">{{ order.customer?.firstName }} {{ order.customer?.lastName }}</div>
              <div class="text-xs text-gray-400">{{ order.customer?.phoneNumber }}</div>
            </td>
            <td class="p-4">{{ order.product?.name }}</td>
            <td class="p-4 text-sm">
              {{ new Date(order.startDate).toLocaleDateString('th-TH') }} - 
              {{ new Date(order.endDate).toLocaleDateString('th-TH') }}
            </td>
            <td class="p-4 font-bold">฿{{ order.totalPrice }}</td>
            <td class="p-4">
              <span class="px-2 py-1 rounded-full text-xs font-semibold" :class="statusColors[order.status]">
                {{ order.status }}
              </span>
            </td>
            <td class="p-4 text-right">
              <button @click="openModal(order)" class="text-blue-600 hover:underline">ตรวจสอบ</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Order Detail Modal -->
    <div v-if="showModal && selectedOrder" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h3 class="text-2xl font-bold text-gray-800">Order #{{ selectedOrder.rentalRef }}</h3>
            <span class="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold" :class="statusColors[selectedOrder.status]">
              {{ selectedOrder.status }}
            </span>
          </div>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <!-- Customer Info -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              👤 ข้อมูลลูกค้า
            </h4>
            <div class="space-y-2 text-sm">
              <p><span class="text-gray-500">ชื่อ:</span> <strong>{{ selectedOrder.customer?.firstName }} {{ selectedOrder.customer?.lastName }}</strong></p>
              <p><span class="text-gray-500">LINE:</span> {{ selectedOrder.customer?.displayName }}</p>
              <p><span class="text-gray-500">โทร:</span> {{ selectedOrder.customer?.phoneNumber }}</p>
              <p><span class="text-gray-500">ที่อยู่:</span> {{ selectedOrder.customPickupAddress || '-' }}</p>
            </div>
          </div>

          <!-- Rental Info -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              📦 ข้อมูลการเช่า
            </h4>
            <div class="space-y-2 text-sm">
              <p><span class="text-gray-500">สินค้า:</span> <strong>{{ selectedOrder.product?.name }}</strong></p>
              <p><span class="text-gray-500">สาขา:</span> {{ selectedOrder.branch?.name }}</p>
              <p><span class="text-gray-500">วันรับ:</span> {{ new Date(selectedOrder.startDate).toLocaleDateString('th-TH') }}</p>
              <p><span class="text-gray-500">วันคืน:</span> {{ new Date(selectedOrder.endDate).toLocaleDateString('th-TH') }}</p>
              <p><span class="text-gray-500">ราคา:</span> <strong class="text-blue-600">฿{{ selectedOrder.totalPrice }}</strong></p>
              <p><span class="text-gray-500">มัดจำ:</span> ฿{{ selectedOrder.depositAmount }}</p>
            </div>
          </div>
        </div>

        <!-- Payment Slip Section -->
        <div v-if="selectedOrder.payment" class="mb-6 bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h4 class="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            💳 ข้อมูลการชำระเงิน
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2 text-sm">
              <p><span class="text-gray-500">จำนวนเงิน:</span> <strong class="text-green-600">฿{{ selectedOrder.payment.amount }}</strong></p>
              <p><span class="text-gray-500">ธนาคาร:</span> {{ selectedOrder.payment.bankName || '-' }}</p>
              <p><span class="text-gray-500">วันที่โอน:</span> {{ selectedOrder.payment.transferDate ? new Date(selectedOrder.payment.transferDate).toLocaleDateString('th-TH') : '-' }}</p>
            </div>

            <!-- Slip Image -->
            <div v-if="selectedOrder.payment.slipUrl" class="flex flex-col items-center">
              <p class="text-xs text-gray-500 mb-2">หลักฐานการโอนเงิน (คลิกเพื่อขยาย)</p>
              <img
                :src="getImageUrl(selectedOrder.payment.slipUrl)"
                alt="Payment Slip"
                class="w-32 h-auto border-2 border-blue-300 rounded-lg shadow-md cursor-pointer hover:scale-105 transition-transform"
                @click="openLightbox(getImageUrl(selectedOrder.payment.slipUrl))"
              />
            </div>
            <div v-else class="flex items-center justify-center text-gray-400 text-sm">
              ยังไม่มีสลิป
            </div>
          </div>
        </div>
        <div v-else class="mb-6 bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-center text-sm text-yellow-700">
          ⚠️ ยังไม่มีข้อมูลการชำระเงิน
        </div>

        <!-- Status History -->
        <div v-if="selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0" class="mb-6">
          <h4 class="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            📋 ประวัติการเปลี่ยนสถานะ
          </h4>
          <div class="space-y-2 max-h-40 overflow-y-auto">
            <div
              v-for="history in selectedOrder.statusHistory"
              :key="history.id"
              class="bg-gray-50 p-3 rounded-lg text-sm border-l-4"
              :class="{
                'border-green-500': history.status === 'APPROVED',
                'border-red-500': history.status === 'REJECTED',
                'border-blue-500': history.status === 'IN_USE',
                'border-gray-500': history.status === 'RETURNED',
                'border-yellow-500': ['PENDING_PAYMENT', 'WAITING_CONFIRMATION'].includes(history.status)
              }"
            >
              <div class="flex justify-between items-start">
                <div>
                  <span class="font-semibold">{{ history.status }}</span>
                  <p v-if="history.note" class="text-gray-600 mt-1">{{ history.note }}</p>
                  <p class="text-xs text-gray-400 mt-1">โดย {{ history.changedBy }}</p>
                </div>
                <span class="text-xs text-gray-400">{{ formatDate(history.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="border-t pt-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">หมายเหตุ (เช่น เหตุผลที่ไม่อนุมัติ)</label>
          <input
            v-model="actionNote"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="ระบุหมายเหตุ..."
          />

          <div class="flex justify-end gap-3">
            <template v-if="selectedOrder.status === 'WAITING_CONFIRMATION'">
              <button @click="updateStatus('REJECTED')" class="px-6 py-2.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium transition-colors">
                ❌ ไม่อนุมัติ
              </button>
              <button @click="updateStatus('APPROVED')" class="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors shadow-sm">
                ✅ อนุมัติการจอง
              </button>
            </template>

            <template v-else-if="selectedOrder.status === 'APPROVED'">
              <button @click="updateStatus('IN_USE')" class="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm">
                📦 ลูกค้ารับของแล้ว
              </button>
            </template>

            <template v-else-if="selectedOrder.status === 'IN_USE'">
              <button @click="updateStatus('RETURNED')" class="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors shadow-sm">
                ✓ คืนของแล้ว (จบงาน)
              </button>
            </template>

            <button @click="showModal = false" class="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors">
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Lightbox for Slip Image -->
    <div v-if="showLightbox" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" @click="showLightbox = false">
      <div class="relative max-w-4xl max-h-[90vh]">
        <button @click="showLightbox = false" class="absolute -top-10 right-0 text-white text-2xl hover:text-gray-300">
          &times; ปิด
        </button>
        <img :src="lightboxImage" alt="Payment Slip" class="max-w-full max-h-[85vh] rounded-lg shadow-2xl" @click.stop />
      </div>
    </div>
  </div>
</template>