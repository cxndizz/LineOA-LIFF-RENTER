<script setup>
defineProps({
  type: {
    type: String,
    default: 'text', // text, title, avatar, card, table, stat-card
    validator: (value) => ['text', 'title', 'avatar', 'card', 'table', 'stat-card'].includes(value)
  },
  count: {
    type: Number,
    default: 1
  },
  height: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <!-- Text Skeleton -->
  <div v-if="type === 'text'" class="space-y-3">
    <div
      v-for="i in count"
      :key="i"
      class="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-shimmer"
      :style="{ width: i === count ? '70%' : '100%' }"
    ></div>
  </div>

  <!-- Title Skeleton -->
  <div v-else-if="type === 'title'">
    <div class="h-8 w-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg animate-shimmer mb-2"></div>
    <div class="h-4 w-64 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-shimmer"></div>
  </div>

  <!-- Avatar Skeleton -->
  <div v-else-if="type === 'avatar'">
    <div class="w-12 h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full animate-shimmer"></div>
  </div>

  <!-- Card Skeleton -->
  <div v-else-if="type === 'card'" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <div class="flex items-start gap-4">
      <div class="w-24 h-24 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg animate-shimmer"></div>
      <div class="flex-1 space-y-3">
        <div class="h-6 w-3/4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-shimmer"></div>
        <div class="h-4 w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-shimmer"></div>
        <div class="h-4 w-5/6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-shimmer"></div>
      </div>
    </div>
  </div>

  <!-- Table Skeleton -->
  <div v-else-if="type === 'table'" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div class="p-4 border-b bg-gray-50">
      <div class="h-5 w-32 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-shimmer"></div>
    </div>
    <div v-for="i in count" :key="i" class="p-4 border-b last:border-b-0">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg animate-shimmer"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 w-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-shimmer"></div>
          <div class="h-3 w-32 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-shimmer"></div>
        </div>
        <div class="h-8 w-20 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-shimmer"></div>
      </div>
    </div>
  </div>

  <!-- Stat Card Skeleton -->
  <div v-else-if="type === 'stat-card'" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <div class="h-4 w-24 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-shimmer mb-3"></div>
    <div class="h-8 w-32 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-shimmer"></div>
  </div>
</template>

<style scoped>
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite linear;
  background-size: 1000px 100%;
}
</style>
