<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'success', // success, error, warning, info
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  message: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 3000
  }
})

const emit = defineEmits(['close'])

// กำหนดสีและไอคอนตามประเภท Toast
const toastStyles = computed(() => {
  const styles = {
    success: {
      bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
      icon: '✓',
      iconBg: 'bg-white/20'
    },
    error: {
      bg: 'bg-gradient-to-r from-red-500 to-rose-600',
      icon: '✕',
      iconBg: 'bg-white/20'
    },
    warning: {
      bg: 'bg-gradient-to-r from-yellow-500 to-amber-600',
      icon: '⚠',
      iconBg: 'bg-white/20'
    },
    info: {
      bg: 'bg-gradient-to-r from-blue-500 to-indigo-600',
      icon: 'ℹ',
      iconBg: 'bg-white/20'
    }
  }
  return styles[props.type]
})

// Auto-dismiss after duration
if (props.duration > 0) {
  setTimeout(() => {
    emit('close')
  }, props.duration)
}
</script>

<template>
  <div
    class="toast-enter flex items-start gap-3 min-w-[320px] max-w-md p-4 rounded-xl shadow-2xl text-white backdrop-blur-sm"
    :class="toastStyles.bg"
  >
    <!-- Icon -->
    <div
      class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg"
      :class="toastStyles.iconBg"
    >
      {{ toastStyles.icon }}
    </div>

    <!-- Message -->
    <div class="flex-1 pt-0.5">
      <p class="text-sm font-medium leading-relaxed">{{ message }}</p>
    </div>

    <!-- Close Button -->
    <button
      @click="emit('close')"
      class="flex-shrink-0 w-6 h-6 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
    >
      <span class="text-lg leading-none">×</span>
    </button>
  </div>
</template>

<style scoped>
.toast-enter {
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
