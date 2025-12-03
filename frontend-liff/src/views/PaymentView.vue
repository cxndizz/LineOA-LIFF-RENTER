<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/utils/axios'

const route = useRoute()
const router = useRouter()

const order = ref(null)
const selectedFile = ref(null)
const previewImage = ref(null)
const isSubmitting = ref(false)

// Mock Data บัญชีธนาคาร (ของจริงอาจดึงจาก API หรือ Config)
const bankInfo = {
  name: 'ธนาคารกสิกรไทย (KBANK)',
  accountName: 'บจก. ไลน์ เรนทัล',
  accountNumber: '123-4-56789-0',
  qrUrl: 'https://placehold.co/200x200?text=QR+Code' // ใส่ URL รูป QR จริงที่นี่
}

onMounted(async () => {
  // ดึงข้อมูล Order มาโชว์ยอดเงิน
  try {
    const response = await api.get(`/rentals/${route.params.id}`)
    order.value = response.data
  } catch (error) {
    alert('ไม่พบข้อมูลคำสั่งซื้อ')
    router.push('/')
  }
})

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  selectedFile.value = file
  previewImage.value = URL.createObjectURL(file)
}

const submitPayment = async () => {
  if (!selectedFile.value) return alert('กรุณาแนบสลิปโอนเงิน')
  
  isSubmitting.value = true
  try {
    const formData = new FormData()
    formData.append('rentalOrderId', order.value.id)
    formData.append('amount', order.value.totalPrice) // ยอดตามจริง
    formData.append('bankName', 'KBANK') // อาจทำ Dropdown ให้เลือก
    formData.append('transferDate', new Date().toISOString())
    formData.append('slip', selectedFile.value)

    await api.post('/payments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    alert('แจ้งชำระเงินเรียบร้อย! รอแอดมินตรวจสอบครับ')
    router.push('/') // กลับหน้าแรก
  } catch (error) {
    console.error(error)
    alert('เกิดข้อผิดพลาด: ' + (error.response?.data?.message || 'ส่งข้อมูลไม่ได้'))
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <div class="bg-white p-4 shadow-sm text-center sticky top-0 z-10">
      <h1 class="font-bold text-lg">ชำระเงิน (Payment)</h1>
    </div>

    <div v-if="order" class="p-4 space-y-6">
      <div class="bg-white p-6 rounded-xl shadow-sm border text-center space-y-4">
        <div>
          <p class="text-gray-500 text-sm">ยอดที่ต้องชำระ</p>
          <p class="text-4xl font-bold text-blue-600">฿{{ order.totalPrice }}</p>
          <p class="text-gray-400 text-xs mt-1">Ref: {{ order.rentalRef }}</p>
        </div>
        
        <div class="border-t border-dashed my-4"></div>

        <div class="flex justify-center">
          <img :src="bankInfo.qrUrl" class="w-48 h-48 border rounded-lg" />
        </div>
        
        <div class="text-sm text-gray-700">
          <p class="font-bold">{{ bankInfo.name }}</p>
          <p>{{ bankInfo.accountNumber }}</p>
          <p>{{ bankInfo.accountName }}</p>
        </div>
      </div>

      <div class="bg-white p-4 rounded-xl shadow-sm border">
        <h3 class="font-bold mb-3">📤 อัปโหลดหลักฐานการโอน</h3>
        
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition relative">
          <input type="file" accept="image/*" @change="handleFileChange" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          
          <div v-if="previewImage" class="relative z-10">
            <img :src="previewImage" class="max-h-64 mx-auto rounded-lg shadow-md" />
            <p class="text-xs text-green-600 mt-2">คลิกเพื่อเปลี่ยนรูป</p>
          </div>
          <div v-else class="text-gray-500 py-4">
            <p>คลิกเพื่อเลือกรูปสลิป</p>
          </div>
        </div>
      </div>
    </div>

    <div class="fixed bottom-0 left-0 right-0 p-4 bg-white border-t safe-area-bottom md:max-w-md md:mx-auto">
      <button 
        @click="submitPayment"
        :disabled="isSubmitting"
        class="w-full bg-green-600 text-white font-bold py-3 rounded-xl disabled:bg-gray-300 transition shadow-lg hover:bg-green-700"
      >
        {{ isSubmitting ? 'กำลังส่งข้อมูล...' : 'ยืนยันการโอนเงิน' }}
      </button>
    </div>
  </div>
</template>