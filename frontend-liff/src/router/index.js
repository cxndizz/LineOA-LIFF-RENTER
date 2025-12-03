// File: frontend-liff/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ProductDetailView from '../views/ProductDetailView.vue' 
import BookingView from '../views/BookingView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/product/:id', // :id คือ parameter
      name: 'product-detail',
      component: ProductDetailView
    },
    {
      path: '/booking/:id',
      name: 'booking',
      component: BookingView
    }
  ]
})

export default router