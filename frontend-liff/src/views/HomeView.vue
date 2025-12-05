<script setup>
import { ref, onMounted, watch } from 'vue'
import { useProductStore } from '@/stores/product'
import { useBranchStore } from '@/stores/branch'
import { useLiffStore } from '@/stores/liff'
import api from '@/utils/axios'

const productStore = useProductStore()
const branchStore = useBranchStore()
const liffStore = useLiffStore()

// ฟังก์ชันสำหรับสร้าง URL รูปภาพ (ป้องกัน double slash)
const getImageUrl = (path) => {
  const cleanPath = path.startsWith('/') ? path.substring(1) : path
  return `${api.defaults.baseURL}/${cleanPath}`
}

// Filter state
const filters = ref({
  search: '',
  branchId: null,
  minPrice: null,
  maxPrice: null,
  status: null
})

const showFilters = ref(false)

// Apply filters
const applyFilters = () => {
  const filterParams = {}

  if (filters.value.search) filterParams.search = filters.value.search
  if (filters.value.branchId) filterParams.branchId = filters.value.branchId
  if (filters.value.minPrice) filterParams.minPrice = filters.value.minPrice
  if (filters.value.maxPrice) filterParams.maxPrice = filters.value.maxPrice
  if (filters.value.status) filterParams.status = filters.value.status

  productStore.fetchProducts(filterParams)
}

// Clear all filters
const clearFilters = () => {
  filters.value = {
    search: '',
    branchId: null,
    minPrice: null,
    maxPrice: null,
    status: null
  }
  productStore.fetchProducts()
}

// Check if any filter is active
const hasActiveFilters = () => {
  return filters.value.search ||
         filters.value.branchId ||
         filters.value.minPrice ||
         filters.value.maxPrice ||
         filters.value.status
}

// Watch search input for real-time search
let searchTimeout = null
watch(() => filters.value.search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    applyFilters()
  }, 500) // Debounce 500ms
})

onMounted(() => {
  productStore.fetchProducts()
  branchStore.fetchBranches()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 pb-20">
    <!-- Header with User Profile -->
    <header class="bg-white px-4 py-4 shadow-sm sticky top-0 z-10">
      <div class="flex items-center justify-between mb-3">
        <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span class="text-3xl">📸</span>
          <span class="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Rental Shop
          </span>
        </h1>

        <!-- User Profile -->
        <div
          v-if="liffStore.isLoggedIn"
          @click="$router.push('/history')"
          class="flex items-center gap-2 cursor-pointer hover:opacity-80 active:scale-95 transition-all"
          title="ดูประวัติการเช่า"
        >
          <div class="text-right hidden sm:block">
            <p class="text-xs text-gray-500">สวัสดี</p>
            <p class="text-sm font-semibold text-gray-800">{{ liffStore.displayName }}</p>
          </div>
          <img
            v-if="liffStore.pictureUrl"
            :src="liffStore.pictureUrl"
            alt="Profile"
            class="w-10 h-10 rounded-full border-2 border-blue-500 shadow-sm"
          />
          <div
            v-else
            class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm"
          >
            {{ liffStore.displayName?.charAt(0) || 'U' }}
          </div>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="flex gap-2">
        <div class="relative flex-1">
          <input
            v-model="filters.search"
            type="text"
            placeholder="ค้นหากล้อง, อุปกรณ์..."
            class="w-full px-4 py-2.5 pr-10 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
          />
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        </div>

        <!-- Filter Toggle Button -->
        <button
          @click="showFilters = !showFilters"
          class="px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2 text-sm font-medium"
          :class="hasActiveFilters() ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-700 border-gray-200'"
        >
          <span>🔧</span>
          <span class="hidden sm:inline">ตัวกรอง</span>
          <span v-if="hasActiveFilters()" class="bg-white text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">!</span>
        </button>
      </div>

      <!-- Filter Panel -->
      <div v-if="showFilters" class="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
        <!-- Branch Filter -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1.5">📍 สาขา</label>
          <select
            v-model="filters.branchId"
            @change="applyFilters"
            class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option :value="null">ทุกสาขา</option>
            <option v-for="branch in branchStore.branches" :key="branch.id" :value="branch.id">
              {{ branch.name }}
            </option>
          </select>
        </div>

        <!-- Price Range -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1.5">💰 ราคาต่ำสุด</label>
            <input
              v-model.number="filters.minPrice"
              @change="applyFilters"
              type="number"
              placeholder="0"
              class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1.5">💰 ราคาสูงสุด</label>
            <input
              v-model.number="filters.maxPrice"
              @change="applyFilters"
              type="number"
              placeholder="∞"
              class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <!-- Status Filter -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1.5">🏷️ สถานะ</label>
          <select
            v-model="filters.status"
            @change="applyFilters"
            class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option :value="null">ทุกสถานะ</option>
            <option value="AVAILABLE">พร้อมให้เช่า</option>
            <option value="UNAVAILABLE">ไม่พร้อม</option>
            <option value="MAINTENANCE">ซ่อมบำรุง</option>
          </select>
        </div>

        <!-- Clear Filters Button -->
        <button
          v-if="hasActiveFilters()"
          @click="clearFilters"
          class="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-all"
        >
          ล้างตัวกรอง ✕
        </button>
      </div>
    </header>

    <main class="p-4">
      <div v-if="productStore.loading" class="flex flex-col items-center justify-center py-12 space-y-4">
        <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-gray-500 text-sm">กำลังโหลดสินค้า...</p>
      </div>

      <div v-else-if="productStore.error" class="text-center py-10 p-4 bg-red-50 rounded-xl">
        <p class="text-red-500 mb-2">❌ {{ productStore.error }}</p>
        <button 
          @click="productStore.fetchProducts()" 
          class="text-sm text-blue-600 underline"
        >
          ลองใหม่อีกครั้ง
        </button>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="productStore.products.length === 0"
        class="flex flex-col items-center justify-center py-16 px-6"
      >
        <div class="text-6xl mb-4">{{ hasActiveFilters() ? '🔍' : '📦' }}</div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">
          {{ hasActiveFilters() ? 'ไม่พบสินค้าที่ตรงกับเงื่อนไข' : 'ยังไม่มีสินค้า' }}
        </h3>
        <p class="text-gray-500 text-center mb-4">
          {{ hasActiveFilters() ? 'ลองปรับเงื่อนไขการค้นหาหรือล้างตัวกรอง' : 'ขณะนี้ยังไม่มีสินค้าในระบบ<br />กรุณากลับมาใหม่ภายหลัง' }}
        </p>
        <button
          v-if="hasActiveFilters()"
          @click="clearFilters"
          class="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all"
        >
          ล้างตัวกรอง
        </button>
      </div>

      <!-- Results Counter & Active Filters -->
      <div v-else class="space-y-3">
        <div class="flex items-center justify-between text-sm">
          <p class="text-gray-600">
            พบ <span class="font-bold text-gray-900">{{ productStore.products.length }}</span> รายการ
          </p>
          <button
            v-if="hasActiveFilters()"
            @click="clearFilters"
            class="text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
          >
            <span>ล้างตัวกรอง</span>
            <span>✕</span>
          </button>
        </div>

        <!-- Product Grid -->
        <div class="grid grid-cols-2 gap-4">
        <div
          v-for="product in productStore.products"
          :key="product.id"
          @click="$router.push(`/product/${product.id}`)"
          class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          <!-- Product Image -->
          <div class="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
            <img
              v-if="product.images && product.images.length > 0"
              :src="getImageUrl(product.images[0].url)"
              class="w-full h-full object-cover"
              alt="Product Image"
              loading="lazy"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
              <div class="text-center">
                <div class="text-4xl mb-1">📷</div>
                <span class="text-xs">ไม่มีรูป</span>
              </div>
            </div>

            <!-- Status Badge -->
            <div v-if="product.status !== 'AVAILABLE'" class="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <span class="bg-red-500 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg">
                ไม่ว่าง
              </span>
            </div>

            <!-- Available Badge -->
            <div v-else class="absolute top-2 right-2">
              <span class="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-md">
                ✓ พร้อมให้เช่า
              </span>
            </div>
          </div>

          <!-- Product Info -->
          <div class="p-3.5 flex-1 flex flex-col">
            <h3 class="font-semibold text-gray-900 text-sm line-clamp-2 mb-1.5 leading-snug min-h-[2.5rem]">
              {{ product.name }}
            </h3>

            <!-- Branch Badge -->
            <div v-if="product.branch" class="mb-2">
              <span class="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                <span>📍</span>
                {{ product.branch.name }}
              </span>
            </div>

            <div class="mt-auto pt-2 border-t border-gray-100">
              <div class="flex items-baseline justify-between mb-2.5">
                <div>
                  <p class="text-blue-600 font-bold text-lg leading-none">
                    ฿{{ product.pricePerDay }}
                  </p>
                  <span class="text-xs text-gray-500">/วัน</span>
                </div>
                <div v-if="product.deposit > 0" class="text-right">
                  <p class="text-xs text-gray-500">มัดจำ</p>
                  <p class="text-xs font-semibold text-gray-700">฿{{ product.deposit }}</p>
                </div>
              </div>

              <button
                class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm py-2.5 rounded-xl active:scale-95 transition-all font-semibold shadow-sm hover:shadow-md"
              >
                จองเลย 🚀
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </main>
  </div>
</template>