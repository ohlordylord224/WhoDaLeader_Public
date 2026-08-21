<script setup lang="ts">
const props = defineProps<{
  value:   number
  suffix?: string
  pill?:   boolean
  lg?:     boolean
  capped?: boolean
}>()

const n     = computed(() => typeof props.value === 'number' ? props.value : parseFloat(String(props.value)))
const dir   = computed(() => isNaN(n.value) || n.value === 0 ? 'flat' : n.value > 0 ? 'up' : 'down')
const glyph = computed(() => ({ up: '▲', down: '▼', flat: '—' } as const)[dir.value])
const cls   = computed(() =>
  ['tvd', `tvd--${dir.value}`, props.pill ? 'tvd--pill' : '', props.lg ? 'tvd--lg' : '']
    .filter(Boolean).join(' ')
)
// When capped show ">999" so the pill never overflows the row.
const amt = computed(() =>
  props.capped ? '>999' : Math.abs(n.value).toFixed(1)
)
</script>

<template>
  <span :class="cls">
    <span class="tvd__arrow" aria-hidden="true">{{ glyph }}</span>
    {{ dir === 'flat' ? 'holding' : `${amt}${suffix ?? '%'}` }}
  </span>
</template>
