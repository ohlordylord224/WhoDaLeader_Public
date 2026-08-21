<script setup lang="ts">
const props = defineProps<{ size?: number }>()
const w = computed(() => props.size ?? 30)
const h = computed(() => Math.round(w.value * 0.62))
</script>

<template>
  <svg class="crown" :width="w" :height="h" viewBox="20.2 13.9 23.6 14.2" role="img" aria-label="Current leader">
    <path d="M22 27 L22 18.5 L27 22 L32 15.5 L37 22 L42 18.5 L42 27 Z"
          fill="var(--rank-1)" stroke="var(--rank-1)" stroke-width="1.6" stroke-linejoin="round" />
  </svg>
</template>
