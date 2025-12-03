// File: src/router/index.js (หรือ .ts)
import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import AdminLayout from '../components/layouts/AdminLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      // ✅ Parent Route: ใช้ AdminLayout ครอบทุกหน้าข้างใน
      path: '/',
      component: AdminLayout,
      meta: { requiresAuth: true }, // เช็คล็อกอินทีเดียวตรงนี้
      children: [
        {
          path: '', // path: '/' (Default) -> Dashboard
          name: 'dashboard',
          component: DashboardView
        },
        // เดี๋ยวเราจะเพิ่ม routes สาขา/สินค้า ต่อท้ายตรงนี้
        // { path: 'branches', ... }
      ]
    }
  ]
})

// Navigation Guard (โค้ดเดิม)
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router