<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import { useLiffStore } from '@/stores/liff'
import api from '@/utils/axios'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const liffStore = useLiffStore()

// State
const product = ref(null)
const dates = ref(null) // เก็บช่วงวันที่เลือก [start, end]
const isSubmitting = ref(false)

// Form Data
const form = ref({
  firstName: '',
  lastName: '',
  phoneNumber: '',
  address: ''
})

onMounted(async () => {
  // ดึงข้อมูลสินค้าที่เลือก
  await productStore.fetchProductById(route.params.id)
  product.value = productStore.currentProduct
  
  // (ถ้ามี) ดึงชื่อจาก LIFF มาใส่ฟอร์มให้อัตโนมัติ
  if (liffStore.profile) {
    form.value.firstName = liffStore.profile.displayName
  }
})

// คำนวณวันและราคา
const summary = computed(() => {
  if (!dates.value || !dates.value[1] || !product.value) return null

  const start = dayjs(dates.value[0])
  const end = dayjs(dates.value[1])
  const days = end.diff(start, 'day') + 1
  const rentalPrice = days * Number(product.value.pricePerDay)
  
  return {
    days,
    rentalPrice,
    deposit: Number(product.value.deposit),
    total: rentalPrice // ยอดที่ต้องโอน (ค่าเช่า) ส่วนมัดจำอาจเก็บแยกหรือรวมแล้วแต่นโยบาย
  }
})

const handleBooking = async () => {
  if (!summary.value) return alert('กรุณาเลือกวันเช่า')
  
  isSubmitting.value = true
  try {
    // เตรียม Payload ส่งไป Backend
    const payload = {
      productId: product.value.id,
      startDate: dates.value[0],
      endDate: dates.value[1],
      lineUserId: liffStore.profile?.userId || 'U_TEST_USER_ID', // ใช้ ID จริง หรือ Test
      displayName: liffStore.profile?.displayName || 'Test User',
      pictureUrl: liffStore.profile?.pictureUrl,
      firstName: form.value.firstName,
      lastName: form.value.lastName,
      phoneNumber: form.value.phoneNumber,
      address: form.value.address
    }

    const response = await api.post('/rentals', payload)
    
    // จองสำเร็จ -> ไปหน้าสำเร็จ (หรือหน้าชำระเงิน)
    alert(`จองสำเร็จ! รหัส ${response.data.rentalRef}`)
    router.push(`/payment/${response.data.id}`) // เดี๋ยวเราจะทำหน้า Order Success ทีหลัง
    
  } catch (error) {
    console.error(error)
    alert('เกิดข้อผิดพลาด: ' + (error.response?.data?.message || 'จองไม่ได้'))
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-24">
    <div class="bg-white p-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
      <button @click="router.back()">⬅️</button>
      <h1 class="font-bold text-lg">ระบุรายละเอียดการเช่า</h1>
    </div>

    <div v-if="product" class="p-4 space-y-6">
      <div class="bg-white p-4 rounded-xl shadow-sm border flex gap-4">
        <img 
          v-if="product.images?.[0]" 
          :src="`http://localhost:3000${product.images[0].url}`" 
          class="w-20 h-20 object-cover rounded-lg bg-gray-100"
        />
        <div>
          <h3 class="font-bold text-gray-900 line-clamp-1">{{ product.name }}</h3>
          <p class="text-blue-600 font-medium">฿{{ product.pricePerDay }} / วัน</p>
        </div>
      </div>

      <div class="bg-white p-4 rounded-xl shadow-sm border">
        <h3 class="font-bold mb-3 flex items-center gap-2">📅 เลือกวันรับ - คืน</h3>
        <VueDatePicker 
          v-model="dates" 
          range 
          :min-date="new Date()"
          :enable-time-picker="false"
          placeholder="กดเพื่อเลือกช่วงเวลา"
          auto-apply
        />
      </div>

      <div class="bg-white p-4 rounded-xl shadow-sm border space-y-3">
        <h3 class="font-bold mb-1">👤 ข้อมูลผู้เช่า</h3>
        
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-gray-500">ชื่อจริง</label>
            <input v-model="form.firstName" class="w-full border rounded-lg p-2 text-sm" placeholder="ชื่อ">
          </div>
          <div>
            <label class="text-xs text-gray-500">นามสกุล</label>
            <input v-model="form.lastName" class="w-full border rounded-lg p-2 text-sm" placeholder="นามสกุล">
          </div>
        </div>

        <div>
          <label class="text-xs text-gray-500">เบอร์โทรศัพท์</label>
          <input v-model="form.phoneNumber" type="tel" class="w-full border rounded-lg p-2 text-sm" placeholder="08x-xxx-xxxx">
        </div>
        
        <div>
          <label class="text-xs text-gray-500">ที่อยู่จัดส่ง / ข้อมูลเพิ่มเติม</label>
          <textarea v-model="form.address" class="w-full border rounded-lg p-2 text-sm" rows="2"></textarea>
        </div>
      </div>

      <div v-if="summary" class="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-2 text-sm">
        <div class="flex justify-between text-gray-600">
          <span>ระยะเวลาเช่า</span>
          <span>{{ summary.days }} วัน</span>
        </div>
        <div class="flex justify-between text-gray-600">
          <span>ค่ามัดจำ (ได้คืน)</span>
          <span>฿{{ summary.deposit }}</span>
        </div>
        <div class="flex justify-between font-bold text-lg text-blue-700 border-t border-blue-200 pt-2 mt-2">
          <span>ยอดชำระรวม</span>
          <span>฿{{ summary.total }}</span>
        </div>
      </div>
    </div>

    <div class="fixed bottom-0 left-0 right-0 p-4 bg-white border-t safe-area-bottom md:max-w-md md:mx-auto">
      <button 
        @click="handleBooking"
        :disabled="isSubmitting || !summary"
        class="w-full bg-blue-600 text-white font-bold py-3 rounded-xl disabled:bg-gray-300 disabled:text-gray-500 transition"
      >
        {{ isSubmitting ? 'กำลังบันทึก...' : 'ยืนยันการจอง' }}
      </button>
    </div>
  </div>
</template>

<style>
/* ปรับแต่งสีปฏิทินให้เข้ากับธีม */
.dp__theme_light {
  --dp-primary-color: #2563eb;
}
</style>