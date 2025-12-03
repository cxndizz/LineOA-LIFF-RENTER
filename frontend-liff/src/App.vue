<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex justify-center">
    <div class="w-full max-w-md bg-white min-h-screen shadow-lg">
      <RouterView />
    </div>
  </div>
</template>