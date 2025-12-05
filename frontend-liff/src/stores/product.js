// File: frontend-liff/src/stores/product.js
import { defineStore } from "pinia";
import { ref } from "vue";
import api from "../utils/axios";

export const useProductStore = defineStore("product", () => {
  const products = ref([]);
  const currentProduct = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const fetchProducts = async (filters = {}) => {
    loading.value = true;
    error.value = null;
    try {
      // Build query parameters from filters
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.branchId) params.append('branchId', filters.branchId);
      if (filters.minPrice !== undefined && filters.minPrice !== null) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice !== undefined && filters.maxPrice !== null) params.append('maxPrice', filters.maxPrice);
      if (filters.status) params.append('status', filters.status);

      const queryString = params.toString();
      const url = queryString ? `/products?${queryString}` : '/products';

      const response = await api.get(url);
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
