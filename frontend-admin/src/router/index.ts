// File: src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import AdminLayout from '../components/layouts/AdminLayout.vue'
import BranchListView from '../views/branches/BranchListView.vue'
import ProductListView from '../views/products/ProductListView.vue'
import OrderListView from '../views/orders/OrderListView.vue'
import UserListView from '../views/users/UserListView.vue'
import CustomerListView from '../views/customers/CustomerListView.vue'
import CustomerDetailView from '../views/customers/CustomerDetailView.vue'

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
        {
          path: 'branches',
          name: 'branches',
          component: BranchListView
        },
        {
          path: 'products',
          name: 'products',
          component: ProductListView
        },
        {
          path: 'orders',
          name: 'orders',
          component: OrderListView
        },
        {
          path: 'users',
          name: 'users',
          component: UserListView
        },
        {
          path: 'customers',
          name: 'customers',
          component: CustomerListView
        },
        {
          path: 'customers/:id',
          name: 'customer-detail',
          component: CustomerDetailView
        }
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