<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter, RouterLink, RouterView } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

// เมนูทั้งหมดของระบบ
const menus = [
  { name: 'Dashboard', path: '/', icon: '📊' },
  { name: 'Manage Branches', path: '/branches', icon: '🏢' },
  { name: 'Manage Products', path: '/products', icon: '📦' },
  { name: 'Manage Orders', path: '/orders', icon: '📝' },
  { name: 'Manage Users', path: '/users', icon: '👥' },
  { name: 'Customers', path: '/customers', icon: '👤' },
]

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="flex h-screen bg-gray-100 font-sans text-gray-900">
    <aside class="w-64 bg-white shadow-md flex flex-col hidden md:flex">
      <div class="p-6 border-b border-gray-100">
        <h1 class="text-2xl font-bold text-blue-600 tracking-tight">Rental Admin</h1>
        <p class="text-xs text-gray-400 mt-1">Back Office System</p>
      </div>

      <nav class="flex-1 p-4 space-y-1">
        <RouterLink 
          v-for="menu in menus" 
          :key="menu.path" 
          :to="menu.path"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 hover:bg-blue-50 hover:text-blue-600"
          active-class="bg-blue-50 text-blue-600 font-semibold"
        >
          <span class="text-xl">{{ menu.icon }}</span>
          <span>{{ menu.name }}</span>
        </RouterLink>
      </nav>

      <div class="p-4 border-t border-gray-100">
        <button 
          @click="handleLogout"
          class="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>

    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <header class="md:hidden bg-white shadow-sm p-4 flex justify-between items-center">
        <span class="font-bold text-blue-600">Rental Admin</span>
        <button @click="handleLogout" class="text-red-500 text-sm">Logout</button>
      </header>

      <main class="flex-1 overflow-auto p-4 md:p-8">
        <div class="max-w-7xl mx-auto">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>