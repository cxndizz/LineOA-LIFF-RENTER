<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/utils/axios'

const users = ref([])
const branches = ref([])
const isLoading = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const currentUser = ref(null)

const form = ref({
  email: '',
  password: '',
  fullName: '',
  role: 'BRANCH_ADMIN',
  branchId: null,
  isActive: true
})

const roles = [
  { value: 'SUPER_ADMIN', label: 'Super Admin', color: 'bg-purple-100 text-purple-800', icon: '👑' },
  { value: 'BRANCH_ADMIN', label: 'Branch Admin', color: 'bg-blue-100 text-blue-800', icon: '🏢' },
  { value: 'STAFF', label: 'Staff', color: 'bg-green-100 text-green-800', icon: '👤' },
]

onMounted(() => {
  fetchUsers()
  fetchBranches()
})

const fetchUsers = async () => {
  isLoading.value = true
  try {
    const response = await api.get('/auth/users')
    users.value = response.data
  } catch (error) {
    console.error('Failed to fetch users:', error)
    alert('ไม่สามารถโหลดข้อมูลผู้ใช้งานได้')
  } finally {
    isLoading.value = false
  }
}

const fetchBranches = async () => {
  try {
    const response = await api.get('/branches')
    branches.value = response.data
  } catch (error) {
    console.error('Failed to fetch branches:', error)
  }
}

const openCreateModal = () => {
  isEditing.value = false
  currentUser.value = null
  form.value = {
    email: '',
    password: '',
    fullName: '',
    role: 'BRANCH_ADMIN',
    branchId: null,
    isActive: true
  }
  showModal.value = true
}

const openEditModal = (user) => {
  isEditing.value = true
  currentUser.value = user
  form.value = {
    email: user.email,
    password: '', // Don't populate password
    fullName: user.fullName,
    role: user.role,
    branchId: user.branchId,
    isActive: user.isActive
  }
  showModal.value = true
}

const handleSubmit = async () => {
  try {
    const payload = { ...form.value }

    // Remove password if empty (for edit)
    if (isEditing.value && !payload.password) {
      delete payload.password
    }

    // Validate required fields
    if (!payload.email || !payload.fullName || !payload.role) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    if (!isEditing.value && !payload.password) {
      alert('กรุณากรอกรหัสผ่าน')
      return
    }

    if (isEditing.value) {
      await api.patch(`/auth/users/${currentUser.value.id}`, payload)
      alert('แก้ไขผู้ใช้งานสำเร็จ')
    } else {
      await api.post('/auth/users', payload)
      alert('สร้างผู้ใช้งานสำเร็จ')
    }

    showModal.value = false
    fetchUsers()
  } catch (error) {
    console.error('Failed to save user:', error)
    alert(error.response?.data?.message || 'เกิดข้อผิดพลาด')
  }
}

const handleDelete = async (user) => {
  if (!confirm(`ยืนยันลบผู้ใช้งาน "${user.fullName}"?`)) return

  try {
    await api.delete(`/auth/users/${user.id}`)
    alert('ลบผู้ใช้งานสำเร็จ')
    fetchUsers()
  } catch (error) {
    console.error('Failed to delete user:', error)
    alert('ไม่สามารถลบผู้ใช้งานได้')
  }
}

const toggleActive = async (user) => {
  try {
    await api.patch(`/auth/users/${user.id}`, {
      isActive: !user.isActive
    })
    fetchUsers()
  } catch (error) {
    console.error('Failed to toggle active status:', error)
    alert('เกิดข้อผิดพลาด')
  }
}

const getRoleConfig = (role) => {
  return roles.find(r => r.value === role) || roles[1]
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-800">จัดการผู้ใช้งาน (Users)</h2>
      <button
        @click="openCreateModal"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        <span>➕</span>
        <span>เพิ่มผู้ใช้งาน</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="users.length === 0" class="bg-white rounded-xl shadow-sm border p-12 text-center">
      <div class="text-6xl mb-4">👥</div>
      <h3 class="text-xl font-bold text-gray-800 mb-2">ยังไม่มีผู้ใช้งาน</h3>
      <p class="text-gray-500 mb-4">เริ่มต้นโดยสร้างผู้ใช้งานคนแรก</p>
      <button
        @click="openCreateModal"
        class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        เพิ่มผู้ใช้งาน
      </button>
    </div>

    <!-- Users Table -->
    <div v-else class="bg-white rounded-xl shadow-sm border overflow-hidden">
      <table class="w-full text-left">
        <thead class="bg-gray-50 text-gray-600 text-sm uppercase">
          <tr>
            <th class="p-4">ID</th>
            <th class="p-4">ชื่อ-อีเมล</th>
            <th class="p-4">บทบาท</th>
            <th class="p-4">สาขา</th>
            <th class="p-4 text-center">สถานะ</th>
            <th class="p-4 text-center">วันที่สร้าง</th>
            <th class="p-4 text-right">จัดการ</th>
          </tr>
        </thead>
        <tbody class="text-sm">
          <tr
            v-for="user in users"
            :key="user.id"
            class="border-t hover:bg-gray-50 transition-colors"
          >
            <!-- ID -->
            <td class="p-4 font-mono text-gray-500">#{{ user.id }}</td>

            <!-- Name & Email -->
            <td class="p-4">
              <p class="font-semibold text-gray-900">{{ user.fullName }}</p>
              <p class="text-xs text-gray-500">{{ user.email }}</p>
            </td>

            <!-- Role -->
            <td class="p-4">
              <span
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                :class="getRoleConfig(user.role).color"
              >
                <span>{{ getRoleConfig(user.role).icon }}</span>
                {{ getRoleConfig(user.role).label }}
              </span>
            </td>

            <!-- Branch -->
            <td class="p-4">
              <span v-if="user.branch" class="text-gray-700">{{ user.branch.name }}</span>
              <span v-else class="text-gray-400 text-xs">ไม่ระบุสาขา</span>
            </td>

            <!-- Active Status -->
            <td class="p-4 text-center">
              <button
                @click="toggleActive(user)"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                :class="user.isActive ? 'bg-green-600' : 'bg-gray-300'"
              >
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  :class="user.isActive ? 'translate-x-6' : 'translate-x-1'"
                ></span>
              </button>
              <p class="text-xs mt-1" :class="user.isActive ? 'text-green-600' : 'text-gray-500'">
                {{ user.isActive ? 'Active' : 'Inactive' }}
              </p>
            </td>

            <!-- Created Date -->
            <td class="p-4 text-center text-xs text-gray-500">
              {{ formatDate(user.createdAt) }}
            </td>

            <!-- Actions -->
            <td class="p-4 text-right">
              <div class="flex items-center justify-end gap-2">
                <button
                  @click="openEditModal(user)"
                  class="px-3 py-1.5 bg-blue-100 text-blue-700 text-xs rounded-lg hover:bg-blue-200 transition-colors"
                >
                  ✏️ แก้ไข
                </button>
                <button
                  @click="handleDelete(user)"
                  class="px-3 py-1.5 bg-red-100 text-red-700 text-xs rounded-lg hover:bg-red-200 transition-colors"
                >
                  🗑️ ลบ
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showModal = false"
    >
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <!-- Modal Header -->
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold">
              {{ isEditing ? 'แก้ไขผู้ใช้งาน' : 'เพิ่มผู้ใช้งานใหม่' }}
            </h3>
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

        <!-- Modal Body -->
        <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
          <!-- Full Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล *</label>
            <input
              v-model="form.fullName"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="เช่น นายสมชาย ใจดี"
            />
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">อีเมล *</label>
            <input
              v-model="form.email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="email@example.com"
            />
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              รหัสผ่าน {{ isEditing ? '(เว้นว่างถ้าไม่ต้องการเปลี่ยน)' : '*' }}
            </label>
            <input
              v-model="form.password"
              type="password"
              :required="!isEditing"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <!-- Role -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">บทบาท *</label>
            <select
              v-model="form.role"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option v-for="role in roles" :key="role.value" :value="role.value">
                {{ role.icon }} {{ role.label }}
              </option>
            </select>
          </div>

          <!-- Branch -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">สาขา (ถ้ามี)</label>
            <select
              v-model="form.branchId"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option :value="null">ไม่ระบุสาขา</option>
              <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                {{ branch.name }}
              </option>
            </select>
          </div>

          <!-- Active Status -->
          <div class="flex items-center gap-3">
            <input
              v-model="form.isActive"
              type="checkbox"
              id="isActive"
              class="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <label for="isActive" class="text-sm font-medium text-gray-700">เปิดใช้งาน (Active)</label>
          </div>

          <!-- Buttons -->
          <div class="flex gap-3 pt-4">
            <button
              type="button"
              @click="showModal = false"
              class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {{ isEditing ? 'บันทึกการแก้ไข' : 'สร้างผู้ใช้งาน' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
