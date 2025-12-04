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

// หารูปสลิปจาก payment (ถ้ามี)
const slipUrl = computed(() => {
  // เนื่องจากใน API เรา include payment ไว้ไหม? 
  // ต้องเช็ค backend ว่า RentalsService.findAll include payment หรือยัง
  // ถ้ายัง ให้แก้ backend นิดนึง หรือถ้า API ส่งมาแล้วก็ใช้ได้เลย
  // สมมติว่า payment ถูกส่งมาคู่กับ order (เดี๋ยวเราไปเช็ค backend กัน)
  return null 
})
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

    <div v-if="showModal && selectedOrder" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between mb-4">
          <h3 class="text-xl font-bold">รายละเอียดคำสั่งซื้อ #{{ selectedOrder.rentalRef }}</h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div class="grid grid-cols-2 gap-6">
          <div class="space-y-2">
            <h4 class="font-semibold text-gray-700 border-b pb-1">ข้อมูลลูกค้า</h4>
            <p><span class="text-gray-500">ชื่อ:</span> {{ selectedOrder.customer?.firstName }} {{ selectedOrder.customer?.lastName }}</p>
            <p><span class="text-gray-500">โทร:</span> {{ selectedOrder.customer?.phoneNumber }}</p>
            <p><span class="text-gray-500">ที่อยู่:</span> {{ selectedOrder.customPickupAddress || '-' }}</p>
          </div>

          <div class="space-y-2">
            <h4 class="font-semibold text-gray-700 border-b pb-1">ข้อมูลการเช่า</h4>
            <p><span class="text-gray-500">สินค้า:</span> {{ selectedOrder.product?.name }}</p>
            <p><span class="text-gray-500">ราคา:</span> ฿{{ selectedOrder.totalPrice }}</p>
            <p><span class="text-gray-500">มัดจำ:</span> ฿{{ selectedOrder.depositAmount }}</p>
          </div>
        </div>

        <div class="mt-8 border-t pt-4">
          <label class="block text-sm text-gray-600 mb-1">หมายเหตุ (เช่น เหตุผลที่ไม่อนุมัติ)</label>
          <input v-model="actionNote" class="w-full border rounded px-3 py-2 mb-4" placeholder="ระบุหมายเหตุ..." />

          <div class="flex justify-end gap-3">
            <template v-if="selectedOrder.status === 'WAITING_CONFIRMATION'">
              <button @click="updateStatus('REJECTED')" class="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200">ไม่อนุมัติ</button>
              <button @click="updateStatus('APPROVED')" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">อนุมัติการจอง</button>
            </template>
            
            <template v-else-if="selectedOrder.status === 'APPROVED'">
              <button @click="updateStatus('IN_USE')" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">ลูกค้ารับของแล้ว</button>
            </template>

            <template v-else-if="selectedOrder.status === 'IN_USE'">
              <button @click="updateStatus('RETURNED')" class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">คืนของแล้ว (จบงาน)</button>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>