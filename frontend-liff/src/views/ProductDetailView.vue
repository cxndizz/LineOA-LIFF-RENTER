<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import api from '@/utils/axios'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()

// ฟังก์ชันสำหรับสร้าง URL รูปภาพ (ป้องกัน double slash)
const getImageUrl = (path) => {
  const cleanPath = path.startsWith('/') ? path.substring(1) : path
  return `${api.defaults.baseURL}/${cleanPath}`
}

onMounted(() => {
  productStore.fetchProductById(route.params.id)
})

const goBack = () => router.back()
</script>

<template>
  <div class="min-h-screen bg-white pb-24 relative">
    <div v-if="productStore.loading" class="flex justify-center items-center h-screen">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="productStore.currentProduct">
      <div class="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-center">
        <button @click="goBack" class="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-sm text-gray-700 hover:bg-white transition">
          ⬅️
        </button>
      </div>

      <div class="relative w-full h-80 bg-gray-100 overflow-hidden">
        <div class="flex overflow-x-auto snap-x snap-mandatory w-full h-full hide-scrollbar">
          <div
            v-for="img in productStore.currentProduct.images"
            :key="img.id"
            class="snap-center w-full flex-shrink-0 h-full"
          >
            <img :src="getImageUrl(img.url)" class="w-full h-full object-cover" />
          </div>
          <div v-if="!productStore.currentProduct.images?.length" class="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        </div>
        </div>

      <div class="p-5 -mt-6 bg-white rounded-t-3xl relative z-0">
        <div class="flex justify-between items-start mb-2">
          <div>
            <span class="text-xs font-semibold bg-blue-50 text-blue-600 px-2 py-1 rounded-md mb-2 inline-block">
              {{ productStore.currentProduct.branch?.name || 'Main Branch' }}
            </span>
            <h1 class="text-2xl font-bold text-gray-900 leading-tight">
              {{ productStore.currentProduct.name }}
            </h1>
          </div>
        </div>

        <div class="mt-4 prose prose-sm text-gray-600">
          <h3 class="text-gray-900 font-semibold mb-1">รายละเอียด</h3>
          <p class="whitespace-pre-line">{{ productStore.currentProduct.description || 'ไม่มีรายละเอียดเพิ่มเติม' }}</p>
        </div>

        <div class="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div class="flex justify-between items-center mb-2">
            <span class="text-gray-600 text-sm">ค่าเช่าต่อวัน</span>
            <span class="text-xl font-bold text-blue-600">฿{{ productStore.currentProduct.pricePerDay }}</span>
          </div>
          <div class="flex justify-between items-center border-t border-gray-200 pt-2">
            <span class="text-gray-500 text-sm">เงินมัดจำ (คืนให้เมื่อส่งคืน)</span>
            <span class="text-gray-700 font-medium">฿{{ productStore.currentProduct.deposit }}</span>
          </div>
        </div>
      </div>

      <div class="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex justify-center md:max-w-md md:mx-auto">
        <button 
          @click="$router.push(`/booking/${productStore.currentProduct.id}`)"
          class="w-full bg-blue-600 ..."
        >
          จองเลย (Book Now)
        </button>
      </div>
    </div>

    <div v-else class="text-center py-20 text-gray-500">
      <p>ไม่พบสินค้า</p>
      <button @click="goBack" class="text-blue-600 underline mt-2">กลับหน้าแรก</button>
    </div>
  </div>
</template>

<style scoped>
/* ซ่อน scrollbar ใน Chrome/Safari/Opera */
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
/* ซ่อน scrollbar ใน IE, Edge และ Firefox */
.hide-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
</style>