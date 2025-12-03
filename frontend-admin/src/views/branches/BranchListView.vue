<script setup>
import { ref, onMounted } from 'vue'
import { branchService } from '@/services/branch.service'

const branches = ref([])
const isLoading = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const errorMessage = ref('')

// Form Model
const form = ref({
  id: null,
  name: '',
  address: '',
  phone: '',
  isActive: true
})

// โหลดข้อมูลเมื่อเข้าหน้าเว็บ
onMounted(() => {
  fetchBranches()
})

const fetchBranches = async () => {
  isLoading.value = true
  try {
    branches.value = await branchService.getAll()
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const openCreateModal = () => {
  isEditing.value = false
  form.value = { name: '', address: '', phone: '', isActive: true }
  showModal.value = true
}

const openEditModal = (branch) => {
  isEditing.value = true
  form.value = { ...branch } // Copy ข้อมูลมาใส่ฟอร์ม
  showModal.value = true
}

const handleSubmit = async () => {
  errorMessage.value = ''
  try {
    if (isEditing.value) {
      await branchService.update(form.value.id, form.value)
    } else {
      await branchService.create(form.value)
    }
    showModal.value = false
    fetchBranches() // โหลดข้อมูลใหม่
  } catch (error) {
    errorMessage.value = 'เกิดข้อผิดพลาด กรุณาลองใหม่'
  }
}

const handleDelete = async (id) => {
  if (!confirm('ยืนยันที่จะลบสาขานี้?')) return
  
  try {
    await branchService.delete(id)
    fetchBranches()
  } catch (error) {
    alert('ลบไม่สำเร็จ อาจมีสินค้าผูกอยู่')
  }
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">จัดการสาขา</h2>
      <button 
        @click="openCreateModal"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
      >
        <span>+</span> เพิ่มสาขา
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead class="bg-gray-50 text-gray-600 text-sm uppercase">
          <tr>
            <th class="p-4 border-b">ID</th>
            <th class="p-4 border-b">ชื่อสาขา</th>
            <th class="p-4 border-b">ที่อยู่</th>
            <th class="p-4 border-b">เบอร์โทร</th>
            <th class="p-4 border-b">สถานะ</th>
            <th class="p-4 border-b text-right">จัดการ</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="isLoading">
            <td colspan="6" class="p-8 text-center text-gray-500">กำลังโหลด...</td>
          </tr>
          <tr v-else-if="branches.length === 0">
            <td colspan="6" class="p-8 text-center text-gray-500">ไม่พบข้อมูลสาขา</td>
          </tr>
          <tr v-else v-for="branch in branches" :key="branch.id" class="hover:bg-gray-50">
            <td class="p-4 text-gray-500">#{{ branch.id }}</td>
            <td class="p-4 font-medium text-gray-900">{{ branch.name }}</td>
            <td class="p-4 text-gray-600 max-w-xs truncate">{{ branch.address || '-' }}</td>
            <td class="p-4 text-gray-600">{{ branch.phone || '-' }}</td>
            <td class="p-4">
              <span 
                class="px-2 py-1 text-xs rounded-full"
                :class="branch.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
              >
                {{ branch.isActive ? 'เปิดบริการ' : 'ปิดชั่วคราว' }}
              </span>
            </td>
            <td class="p-4 text-right space-x-2">
              <button @click="openEditModal(branch)" class="text-blue-600 hover:underline">แก้ไข</button>
              <button @click="handleDelete(branch.id)" class="text-red-600 hover:underline">ลบ</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <h3 class="text-xl font-bold mb-4">{{ isEditing ? 'แก้ไขสาขา' : 'เพิ่มสาขาใหม่' }}</h3>
        
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อสาขา <span class="text-red-500">*</span></label>
            <input v-model="form.name" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ที่อยู่</label>
            <textarea v-model="form.address" rows="2" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">เบอร์โทร</label>
            <input v-model="form.phone" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div class="flex items-center gap-2">
            <input type="checkbox" v-model="form.isActive" id="status" class="w-4 h-4 text-blue-600 rounded">
            <label for="status" class="text-sm text-gray-700">เปิดให้บริการ</label>
          </div>

          <div v-if="errorMessage" class="text-red-500 text-sm">{{ errorMessage }}</div>

          <div class="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button type="button" @click="showModal = false" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">ยกเลิก</button>
            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">บันทึก</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>