// File: frontend-liff/src/stores/product.js
import { defineStore } from "pinia";
import { ref } from "vue";
import api from "../utils/axios";

export const useProductStore = defineStore("product", () => {
  const products = ref([]);
  const currentProduct = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const fetchProducts = async () => {
    loading.value = true;
    error.value = null;
    try {
      // เรียก API GET /products (เส้นนี้เราเปิด Public ไว้แล้วที่ Backend)
      const response = await api.get("/products");
      products.value = response.data;
    } catch (err) {
      console.error("Error fetching products:", err);
      error.value = "ไม่สามารถโหลดข้อมูลสินค้าได้";
    } finally {
      loading.value = false;
    }
  };

  const fetchProductById = async (id) => {
    loading.value = true;
    error.value = null;
    currentProduct.value = null;
    try {
      const response = await api.get(`/products/${id}`);
      currentProduct.value = response.data;
    } catch (err) {
      console.error("Error fetching product:", err);
      error.value = "ไม่พบข้อมูลสินค้า";
    } finally {
      loading.value = false;
    }
  };

  return {
    products,
    currentProduct,
    loading,
    error,
    fetchProducts,
    fetchProductById,
  };
});
