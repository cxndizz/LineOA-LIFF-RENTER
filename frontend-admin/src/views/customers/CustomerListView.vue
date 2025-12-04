<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { customerService } from '@/services/customer.service'
import { useToast } from '@/composables/useToast'
import Skeleton from '@/components/Skeleton.vue'

const router = useRouter()
const toast = useToast()

// State
const customers = ref([])
const isLoading = ref(true)
const searchQuery = ref('')
const sortBy = ref('totalSpent') // totalSpent, totalRentals, name

onMounted(async () => {
  await fetchCustomers()
})

const fetchCustomers = async () => {
  isLoading.value = true
  try {
    customers.value = await customerService.getAll()
  } catch (error) {
    console.error('Error fetching customers:', error)
    toast.error('ไม่สามารถโหลดข้อมูลลูกค้าได้')
  } finally {
    isLoading.value = false
  }
}

// ฟิลเตอร์และจัดเรียงข้อมูล
const filteredCustomers = computed(() => {
  let result = customers.value

  // Search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(customer => {
      const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase()
      const phone = customer.phoneNumber?.toLowerCase() || ''
      const lineId = customer.lineDisplayName?.toLowerCase() || ''
      return fullName.includes(query) || phone.includes(query) || lineId.includes(query)
    })
  }

  // Sort
  result = [...result].sort((a, b) => {
    if (sortBy.value === 'totalSpent') {
      return (b.totalSpent || 0) - (a.totalSpent || 0)
    } else if (sortBy.value === 'totalRentals') {
      return (b.totalRentals || 0) - (a.totalRentals || 0)
    } else {
      return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
    }
  })

  return result
})

// สถิติรวม
const totalStats = computed(() => {
  return {
    totalCustomers: customers.value.length,
    totalRevenue: customers.value.reduce((sum, c) => sum + (c.totalSpent || 0), 0),
    activeCustomers: customers.value.filter(c => (c.activeRentals || 0) > 0).length,
    avgSpent: customers.value.length > 0
      ? customers.value.reduce((sum, c) => sum + (c.totalSpent || 0), 0) / customers.value.length
      : 0
  }
})

const viewCustomerDetail = (customerId) => {
  router.push(`/customers/${customerId}`)
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount || 0)
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <!-- Header -->
    <div class="mb-8">
      <h2 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        จัดการลูกค้า
      </h2>
      <p class="text-gray-500 mt-2">ข้อมูลลูกค้าและประวัติการเช่าทั้งหมด</p>
    </div>

    <!-- Stats Cards -->
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Skeleton type="stat-card" v-for="i in 4" :key="i" />
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-xl text-white">
        <div class="text-blue-100 text-sm font-medium mb-2">ลูกค้าทั้งหมด</div>
        <div class="text-4xl font-bold">{{ totalStats.totalCustomers }}</div>
        <div class="text-blue-100 text-xs mt-1">คน</div>
      </div>

      <div class="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-2xl shadow-xl text-white">
        <div class="text-emerald-100 text-sm font-medium mb-2">รายได้รวม</div>
        <div class="text-3xl font-bold">฿{{ totalStats.totalRevenue.toLocaleString() }}</div>
        <div class="text-emerald-100 text-xs mt-1">บาท</div>
      </div>

      <div class="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-xl text-white">
        <div class="text-purple-100 text-sm font-medium mb-2">กำลังเช่าอยู่</div>
        <div class="text-4xl font-bold">{{ totalStats.activeCustomers }}</div>
        <div class="text-purple-100 text-xs mt-1">คน</div>
      </div>

      <div class="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-2xl shadow-xl text-white">
        <div class="text-orange-100 text-sm font-medium mb-2">ค่าใช้จ่ายเฉลี่ย</div>
        <div class="text-3xl font-bold">฿{{ Math.round(totalStats.avgSpent).toLocaleString() }}</div>
        <div class="text-orange-100 text-xs mt-1">ต่อคน</div>
      </div>
    </div>

    <!-- Search and Filter -->
    <div class="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-6">
      <div class="flex flex-col md:flex-row gap-4">
        <!-- Search -->
        <div class="flex-1 relative">
          <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ค้นหาชื่อ, เบอร์โทร, LINE ID..."
            class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <!-- Sort -->
        <div class="relative">
          <select
            v-model="sortBy"
            class="appearance-none pl-4 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white cursor-pointer"
          >
            <option value="totalSpent">เรียงตามยอดใช้จ่าย</option>
            <option value="totalRentals">เรียงตามจำนวนการเช่า</option>
            <option value="name">เรียงตามชื่อ A-Z</option>
          </select>
          <svg class="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Customer List -->
    <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div v-if="isLoading" class="p-6">
        <Skeleton type="table" :count="5" />
      </div>

      <div v-else-if="filteredCustomers.length === 0" class="p-20 text-center">
        <div class="text-gray-400 text-lg mb-2">ไม่พบข้อมูลลูกค้า</div>
        <div class="text-gray-400 text-sm">ลองใช้คำค้นหาอื่น</div>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gradient-to-r from-slate-100 to-gray-100 text-gray-700 text-sm font-semibold">
            <tr>
              <th class="p-4 text-left">ลูกค้า</th>
              <th class="p-4 text-left">ข้อมูลติดต่อ</th>
              <th class="p-4 text-center">จำนวนการเช่า</th>
              <th class="p-4 text-center">กำลังเช่าอยู่</th>
              <th class="p-4 text-right">ยอดใช้จ่ายรวม</th>
              <th class="p-4 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="customer in filteredCustomers"
              :key="customer.id"
              class="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all cursor-pointer"
              @click="viewCustomerDetail(customer.id)"
            >
              <!-- ลูกค้า -->
              <td class="p-4">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                    {{ customer.firstName?.[0] || '?' }}{{ customer.lastName?.[0] || '' }}
                  </div>
                  <div>
                    <div class="font-semibold text-gray-800">
                      {{ customer.firstName }} {{ customer.lastName }}
                    </div>
                    <div class="text-xs text-gray-400">LINE: {{ customer.lineDisplayName || '-' }}</div>
                  </div>
                </div>
              </td>

              <!-- ข้อมูลติดต่อ -->
              <td class="p-4">
                <div class="text-sm text-gray-600">{{ customer.phoneNumber || '-' }}</div>
                <div class="text-xs text-gray-400">{{ customer.email || '-' }}</div>
              </td>

              <!-- จำนวนการเช่า -->
              <td class="p-4 text-center">
                <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold">
                  {{ customer.totalRentals || 0 }}
                </div>
              </td>

              <!-- กำลังเช่าอยู่ -->
              <td class="p-4 text-center">
                <span
                  v-if="customer.activeRentals > 0"
                  class="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold"
                >
                  {{ customer.activeRentals }} รายการ
                </span>
                <span v-else class="text-gray-400 text-sm">-</span>
              </td>

              <!-- ยอดใช้จ่ายรวม -->
              <td class="p-4 text-right">
                <div class="font-bold text-lg text-gray-800">
                  {{ formatCurrency(customer.totalSpent) }}
                </div>
              </td>

              <!-- จัดการ -->
              <td class="p-4 text-center">
                <button
                  @click.stop="viewCustomerDetail(customer.id)"
                  class="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all font-medium text-sm shadow-md hover:shadow-lg"
                >
                  ดูรายละเอียด
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
