<script setup>
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <div>
    <div class="mb-8">
      <h2 class="text-3xl font-bold text-gray-800">Dashboard</h2>
      <p class="text-gray-500 mt-1">Welcome back, <span class="font-semibold text-blue-600">{{ authStore.user?.fullName }}</span> 👋</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div class="text-gray-400 text-sm font-medium mb-1">Today's Orders</div>
        <div class="text-3xl font-bold text-gray-800">12</div>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div class="text-gray-400 text-sm font-medium mb-1">Total Products</div>
        <div class="text-3xl font-bold text-gray-800">45</div>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div class="text-gray-400 text-sm font-medium mb-1">Active Branches</div>
        <div class="text-3xl font-bold text-gray-800">3</div>
      </div>
    </div>

    <div class="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center py-20">
      <p class="text-gray-400">Graph & Chart areas will be here...</p>
    </div>
  </div>
</template>