// File: frontend-liff/vite.config.ts
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite' // ✅ เพิ่ม

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(), // ✅ เพิ่ม
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // เพิ่ม Server Config เพื่อให้รันคนละ Port กับ Admin (Admin=5173, LIFF=5174)
  server: {
    port: 5174
  }
})