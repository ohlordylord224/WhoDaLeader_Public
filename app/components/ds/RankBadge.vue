<script setup lang="ts">
const props = defineProps<{ rank: number; size?: 'md' | 'lg' }>()

const color = computed(() => {
  if (props.rank === 1) return 'var(--rank-1)'
  if (props.rank === 2) return 'var(--rank-2)'
  if (props.rank === 3) return 'var(--rank-3)'
  return 'var(--text-faint)'
})
</script>

<template>
  <span class="rankbadge" :class="`rankbadge--${size ?? 'md'}`" :style="{ color }">
    {{ rank }}
  </span>
</template>
