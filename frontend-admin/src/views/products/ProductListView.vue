<script setup>
import { ref, onMounted } from 'vue'
import { productService } from '@/services/product.service'
import { branchService } from '@/services/branch.service'

// State
const products = ref([])
const branches = ref([])
const isLoading = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const errorMessage = ref('')

// Form State
const form = ref({
  id: null,
  name: '',
  description: '',
  pricePerDay: 0,
  deposit: 0,
  branchId: '', // สำหรับ Dropdown
  images: [] // สำหรับเก็บไฟล์รูปรออัปโหลด
})

const previewImages = ref([]) // สำหรับโชว์รูปตัวอย่างก่อนอัปโหลด

// --- Base URL สำหรับรูปภาพ ---
const API_URL = 'http://localhost:3000'

onMounted(() => {
  fetchProducts()
  fetchBranches() // ดึงสาขาเตรียมไว้ใส่ Dropdown
})

const fetchProducts = async () => {
  isLoading.value = true
  try {
    products.value = await productService.getAll()
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const fetchBranches = async () => {
  try {
    branches.value = await branchService.getAll()
  } catch (error) {
    console.error('Failed to load branches')
  }
}

const openCreateModal = () => {
  isEditing.value = false
  form.value = { name: '', description: '', pricePerDay: 0, deposit: 0, branchId: '', images: [] }
  previewImages.value = []
  showModal.value = true
}

const openEditModal = (product) => {
  isEditing.value = true
  // Copy ข้อมูลมาใส่ฟอร์ม (ยกเว้นรูป เพราะเรายังไม่ทำแก้รูปในเฟสนี้)
  form.value = { 
    id: product.id,
    name: product.name,
    description: product.description,
    pricePerDay: product.pricePerDay,
    deposit: product.deposit,
    branchId: product.branchId
  }
  showModal.value = true
}

// จัดการเมื่อเลือกไฟล์รูป
const handleFileChange = (event) => {
  const files = event.target.files
  if (!files.length) return

  form.value.images = files // เก็บไฟล์ลง form
  
  // สร้าง URL ปลอมๆ เพื่อโชว์ตัวอย่าง (Preview)
  previewImages.value = []
  for (let i = 0; i < files.length; i++) {
    previewImages.value.push(URL.createObjectURL(files[i]))
  }
}

const handleSubmit = async () => {
  errorMessage.value = ''
  try {
    if (isEditing.value) {
      await productService.update(form.value.id, form.value)
    } else {
      await productService.create(form.value)
    }
    showModal.value = false
    fetchProducts()
  } catch (error) {
    console.error(error)
    errorMessage.value = 'เกิดข้อผิดพลาด: ' + (error.response?.data?.message || 'โปรดลองใหม่')
  }
}

const handleDelete = async (id) => {
  if (!confirm('ยืนยันลบสินค้านี้?')) return
  await productService.delete(id)
  fetchProducts()
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">จัดการสินค้า</h2>
      <button 
        @click="openCreateModal"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
      >
        <span>+</span> เพิ่มสินค้า
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="w-full text-left">
        <thead class="bg-gray-50 text-gray-600 text-sm uppercase">
          <tr>
            <th class="p-4">รูปภาพ</th>
            <th class="p-4">ชื่อสินค้า</th>
            <th class="p-4">ราคา/วัน</th>
            <th class="p-4">สาขา</th>
            <th class="p-4 text-right">จัดการ</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="isLoading"><td colspan="5" class="p-8 text-center text-gray-500">กำลังโหลด...</td></tr>
          <tr v-else-if="products.length === 0"><td colspan="5" class="p-8 text-center text-gray-500">ไม่มีสินค้า</td></tr>
          
          <tr v-for="product in products" :key="product.id" class="hover:bg-gray-50">
            <td class="p-4">
              <div class="flex -space-x-2 overflow-hidden">
                <div v-if="!product.images || product.images.length === 0" 
                    class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-400 border-2 border-white">
                  No
                </div>

                <template v-else>
                  <img 
                    v-for="(img, idx) in product.images.slice(0, 5)" 
                    :key="img.id"
                    :src="`${API_URL}${img.url}`" 
                    class="inline-block w-10 h-10 rounded-full ring-2 ring-white object-cover"
                    :alt="product.name"
                    :title="idx === 0 ? 'Main Image' : ''"
                  >
                  <div v-if="product.images.length > 5" 
                      class="flex items-center justify-center w-10 h-10 text-xs font-medium text-white bg-gray-400 border-2 border-white rounded-full hover:bg-gray-500">
                    +{{ product.images.length - 5 }}
                  </div>
                </template>
              </div>
            </td>
            <td class="p-4">
              <div class="font-medium text-gray-900">{{ product.name }}</div>
              <div class="text-xs text-gray-500 truncate max-w-xs">{{ product.description }}</div>
            </td>
            <td class="p-4 text-blue-600 font-medium">฿{{ product.pricePerDay }}</td>
            <td class="p-4 text-gray-600 text-sm">
              <span class="bg-gray-100 px-2 py-1 rounded">{{ product.branch?.name || 'Unknown' }}</span>
            </td>
            <td class="p-4 text-right space-x-2">
              <button @click="openEditModal(product)" class="text-blue-600 hover:underline">แก้ไข</button>
              <button @click="handleDelete(product.id)" class="text-red-600 hover:underline">ลบ</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-bold mb-4">{{ isEditing ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่' }}</h3>
        
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="col-span-2">
              <label class="block text-sm font-medium mb-1">ชื่อสินค้า <span class="text-red-500">*</span></label>
              <input v-model="form.name" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div class="col-span-2">
              <label class="block text-sm font-medium mb-1">รายละเอียด</label>
              <textarea v-model="form.description" rows="3" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">ราคาเช่าต่อวัน (บาท)</label>
              <input v-model="form.pricePerDay" type="number" required class="w-full px-3 py-2 border rounded-lg outline-none" />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">ค่ามัดจำ (บาท)</label>
              <input v-model="form.deposit" type="number" required class="w-full px-3 py-2 border rounded-lg outline-none" />
            </div>

            <div class="col-span-2">
              <label class="block text-sm font-medium mb-1">ประจำสาขา</label>
              <select v-model="form.branchId" required class="w-full px-3 py-2 border rounded-lg outline-none bg-white">
                <option value="" disabled>-- เลือกสาขา --</option>
                <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                  {{ branch.name }}
                </option>
              </select>
            </div>

            <div v-if="!isEditing" class="col-span-2">
              <label class="block text-sm font-medium mb-2">รูปภาพสินค้า</label>
              <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition cursor-pointer relative">
                <input type="file" multiple accept="image/*" @change="handleFileChange" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div class="text-gray-500">
                  <span class="text-blue-600 font-medium">คลิกเพื่อเลือกรูป</span> หรือลากไฟล์มาวาง
                </div>
              </div>
              
              <div v-if="previewImages.length" class="flex gap-2 mt-4 overflow-x-auto pb-2">
                <img v-for="(img, idx) in previewImages" :key="idx" :src="img" class="w-20 h-20 object-cover rounded-lg border shadow-sm" />
              </div>
            </div>
          </div>

          <div v-if="errorMessage" class="text-red-500 text-sm mt-2">{{ errorMessage }}</div>

          <div class="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button type="button" @click="showModal = false" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">ยกเลิก</button>
            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {{ isEditing ? 'บันทึกการแก้ไข' : 'สร้างสินค้า' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>