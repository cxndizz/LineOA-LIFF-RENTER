// File: frontend-liff/src/utils/axios.js
import axios from 'axios'

const api = axios.create({
  baseURL: 'https://api.fortestonlyme.online',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export default api
