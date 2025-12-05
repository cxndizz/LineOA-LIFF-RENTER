// File: frontend-liff/src/stores/branch.js
import { defineStore } from "pinia";
import { ref } from "vue";
import api from "../utils/axios";

export const useBranchStore = defineStore("branch", () => {
  const branches = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchBranches = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.get("/branches");
      branches.value = response.data;
    } catch (err) {
      console.error("Error fetching branches:", err);
      error.value = "ไม่สามารถโหลดข้อมูลสาขาได้";
    } finally {
      loading.value = false;
    }
  };

  return {
    branches,
    loading,
    error,
    fetchBranches,
  };
});
