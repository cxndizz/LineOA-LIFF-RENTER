// File: frontend-liff/src/utils/axios.js
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000', // ชี้ไปที่ Backend ของเรา
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export default api