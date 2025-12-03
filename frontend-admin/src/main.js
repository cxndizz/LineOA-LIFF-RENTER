// File: frontend-admin/src/main.ts
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router' // ✅ นำเข้า Router

const app = createApp(App)

app.use(createPinia())
app.use(router) 

app.mount('#app')