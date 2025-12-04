<script setup>
import { onMounted } from 'vue'
import { useProductStore } from '@/stores/product'
import api from '@/utils/axios'

const productStore = useProductStore()

// ฟังก์ชันสำหรับสร้าง URL รูปภาพ (ป้องกัน double slash)
const getImageUrl = (path) => {
  const cleanPath = path.startsWith('/') ? path.substring(1) : path
  return `${api.defaults.baseURL}/${cleanPath}`
}

onMounted(() => {
  productStore.fetchProducts()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <header class="bg-white px-4 py-3 shadow-sm sticky top-0 z-10 flex items-center justify-between">
      <h1 class="text-xl font-bold text-gray-800 flex items-center gap-2">
        <span>📸</span> Rental Shop
      </h1>
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

      <div v-else class="grid grid-cols-2 gap-4">
        <div 
          v-for="product in productStore.products" 
          :key="product.id"
          @click="$router.push(`/product/${product.id}`)" 
          class="bg-white rounded-xl ... cursor-pointer" 
        >
          <div class="aspect-square bg-gray-100 relative">
            <img
              v-if="product.images && product.images.length > 0"
              :src="getImageUrl(product.images[0].url)"
              class="w-full h-full object-cover"
              alt="Product Image"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
              <span class="text-xs">No Image</span>
            </div>
            
            <div v-if="product.status !== 'AVAILABLE'" class="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span class="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                ไม่ว่าง
              </span>
            </div>
          </div>

          <div class="p-3 flex-1 flex flex-col">
            <h3 class="font-medium text-gray-900 text-sm line-clamp-2 mb-1 leading-snug">
              {{ product.name }}
            </h3>
            
            <div class="mt-auto pt-2">
              <p class="text-blue-600 font-bold text-lg leading-none">
                ฿{{ product.pricePerDay }} 
                <span class="text-xs text-gray-500 font-normal">/วัน</span>
              </p>
              
              <button class="mt-3 w-full bg-blue-600 text-white text-sm py-2 rounded-lg active:bg-blue-700 transition-colors font-medium">
                จองเลย
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>