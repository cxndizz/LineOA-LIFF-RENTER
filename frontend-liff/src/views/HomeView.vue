<script setup>
import { ref, onMounted, computed } from 'vue'
import { useProductStore } from '@/stores/product'
import { useLiffStore } from '@/stores/liff'
import api from '@/utils/axios'

const productStore = useProductStore()
const liffStore = useLiffStore()

// Filter state
const searchQuery = ref('')
const selectedBranch = ref('ALL')
const minPrice = ref(0)
const maxPrice = ref(10000)
const showFilters = ref(false)

// ฟังก์ชันสำหรับสร้าง URL รูปภาพ
const getImageUrl = (path) => {
  const cleanPath = path.startsWith('/') ? path.substring(1) : path
  return `${api.defaults.baseURL}/${cleanPath}`
}

// ดึงสาขาทั้งหมด (unique branches)
const branches = computed(() => {
  const branchSet = new Set()
  productStore.products.forEach(product => {
    if (product.branch?.name) {
      branchSet.add(JSON.stringify({ id: product.branch.id, name: product.branch.name }))
    }
  })
  return Array.from(branchSet).map(b => JSON.parse(b))
})

// ฟิลเตอร์สินค้า
const filteredProducts = computed(() => {
  let result = productStore.products

  // Search by name
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(p => p.name.toLowerCase().includes(query))
  }

  // Filter by branch
  if (selectedBranch.value !== 'ALL') {
    result = result.filter(p => p.branch?.id === selectedBranch.value)
  }

  // Filter by price
  result = result.filter(p => p.pricePerDay >= minPrice.value && p.pricePerDay <= maxPrice.value)

  return result
})

// นับตัวกรองที่ใช้งาน
const activeFiltersCount = computed(() => {
  let count = 0
  if (selectedBranch.value !== 'ALL') count++
  if (minPrice.value > 0 || maxPrice.value < 10000) count++
  return count
})

const clearFilters = () => {
  selectedBranch.value = 'ALL'
  minPrice.value = 0
  maxPrice.value = 10000
  searchQuery.value = ''
}

onMounted(() => {
  productStore.fetchProducts()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pb-20">
    <!-- Header -->
    <header class="bg-white px-4 py-4 shadow-md sticky top-0 z-20">
      <div class="flex items-center justify-between mb-3">
        <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
          📸 Rental Shop
        </h1>
        <div class="text-xs text-gray-500">
          {{ liffStore.userProfile?.displayName || 'Guest' }}
        </div>
      </div>

      <!-- Search Bar -->
      <div class="relative">
        <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="ค้นหาสินค้า..."
          class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      <!-- Filter Button -->
      <button
        @click="showFilters = !showFilters"
        class="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span class="font-medium">ตัวกรอง</span>
        <span v-if="activeFiltersCount > 0" class="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
          {{ activeFiltersCount }}
        </span>
      </button>
    </header>

    <!-- Filter Panel -->
    <transition
      enter-active-class="transition-all duration-300"
      enter-from-class="opacity-0 -translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-300"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <div v-if="showFilters" class="bg-white mx-4 mt-4 p-4 rounded-xl shadow-lg border border-gray-200">
        <!-- Branch Filter -->
        <div class="mb-4">
          <label class="block text-sm font-semibold text-gray-700 mb-2">สาขา</label>
          <select
            v-model="selectedBranch"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">ทุกสาขา</option>
            <option v-for="branch in branches" :key="branch.id" :value="branch.id">
              {{ branch.name }}
            </option>
          </select>
        </div>

        <!-- Price Range -->
        <div class="mb-4">
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            ช่วงราคา: ฿{{ minPrice }} - ฿{{ maxPrice }}
          </label>
          <div class="flex gap-3">
            <input
              v-model.number="minPrice"
              type="range"
              min="0"
              max="10000"
              step="100"
              class="flex-1"
            />
            <input
              v-model.number="maxPrice"
              type="range"
              min="0"
              max="10000"
              step="100"
              class="flex-1"
            />
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-2">
          <button
            @click="clearFilters"
            class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium"
          >
            ล้างตัวกรอง
          </button>
          <button
            @click="showFilters = false"
            class="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium"
          >
            ปิด
          </button>
        </div>
      </div>
    </transition>

    <!-- Active Filters -->
    <div v-if="activeFiltersCount > 0" class="px-4 mt-4 flex flex-wrap gap-2">
      <div v-if="selectedBranch !== 'ALL'" class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
        <span>สาขา: {{ branches.find(b => b.id === selectedBranch)?.name }}</span>
        <button @click="selectedBranch = 'ALL'" class="hover:bg-blue-200 rounded-full p-0.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div v-if="minPrice > 0 || maxPrice < 10000" class="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
        <span>฿{{ minPrice }} - ฿{{ maxPrice }}</span>
        <button @click="minPrice = 0; maxPrice = 10000" class="hover:bg-purple-200 rounded-full p-0.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Product Grid -->
    <main class="p-4">
      <!-- Loading State -->
      <div v-if="productStore.loading" class="flex flex-col items-center justify-center py-20">
        <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-gray-500 text-sm mt-4">กำลังโหลดสินค้า...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="productStore.error" class="text-center py-10 p-6 bg-red-50 rounded-2xl">
        <div class="text-5xl mb-3">❌</div>
        <p class="text-red-600 mb-3 font-medium">{{ productStore.error }}</p>
        <button
          @click="productStore.fetchProducts()"
          class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium"
        >
          ลองใหม่อีกครั้ง
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredProducts.length === 0" class="text-center py-20">
        <div class="text-6xl mb-4">🔍</div>
        <p class="text-gray-500 text-lg font-medium mb-2">ไม่พบสินค้า</p>
        <p class="text-gray-400 text-sm">ลองเปลี่ยนตัวกรองหรือคำค้นหา</p>
      </div>

      <!-- Product Grid -->
      <div v-else class="grid grid-cols-2 gap-4">
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          @click="$router.push(`/product/${product.id}`)"
          class="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden transform hover:-translate-y-1"
        >
          <!-- Product Image -->
          <div class="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
            <img
              v-if="product.images && product.images.length > 0"
              :src="getImageUrl(product.images[0].url)"
              class="w-full h-full object-cover"
              :alt="product.name"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
              <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>

            <!-- Status Badge -->
            <div v-if="product.status !== 'AVAILABLE'" class="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <span class="bg-red-500 text-white text-sm px-4 py-2 rounded-full font-bold shadow-lg">
                ไม่ว่าง
              </span>
            </div>

            <!-- Branch Badge -->
            <div class="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700">
              {{ product.branch?.name || 'N/A' }}
            </div>
          </div>

          <!-- Product Info -->
          <div class="p-4">
            <h3 class="font-semibold text-gray-900 text-sm line-clamp-2 mb-2 min-h-[2.5rem]">
              {{ product.name }}
            </h3>

            <div class="flex items-end justify-between">
              <div>
                <p class="text-blue-600 font-bold text-xl">
                  ฿{{ product.pricePerDay }}
                </p>
                <span class="text-xs text-gray-500">/วัน</span>
              </div>

              <button class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg">
                จอง
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Results Count -->
      <div v-if="!productStore.loading && filteredProducts.length > 0" class="text-center mt-6 text-sm text-gray-500">
        แสดง {{ filteredProducts.length }} จาก {{ productStore.products.length }} สินค้า
      </div>
    </main>
  </div>
</template>
