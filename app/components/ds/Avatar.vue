<script setup lang="ts">
type Ring = 'gold' | 'silver' | 'bronze' | 'up' | null | undefined

const props = defineProps<{
  name: string
  size?: 'md' | 'lg'
  ring?: Ring
  crown?: boolean   // render a crown centred above the avatar (the current #1)
}>()

// Deterministic color from name
const PALETTE = ['#2f8bff','#19d894','#ff8311','#2dd4cf','#ffc93d','#1f97f0','#f5365c','#14b8b1']
const bg = computed(() => {
  let h = 0
  for (const c of props.name) h = (h << 5) - h + c.charCodeAt(0)
  return PALETTE[Math.abs(h) % PALETTE.length]
})

const initials = computed(() => {
  const parts = props.name.trim().split(/\s+/)
  return parts.length >= 2
    ? ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
    : props.name.slice(0, 2).toUpperCase()
})

const RING_COLORS: Record<string, string> = {
  gold:   'var(--rank-1)',
  silver: 'var(--rank-2)',
  bronze: 'var(--rank-3)',
  up:     'var(--up)',
}

const boxShadow = computed(() =>
  props.ring ? `0 0 0 3px ${RING_COLORS[props.ring] ?? 'transparent'}` : undefined
)

const crownSize = computed(() => (props.size === 'lg' ? 22 : 16))
</script>

<template>
  <span class="avatar-wrap" :class="`avatar-wrap--${size ?? 'md'}`">
    <span
      class="avatar"
      :class="`avatar--${size ?? 'md'}`"
      :style="{ background: bg, boxShadow }"
      aria-hidden="true"
    >{{ initials }}</span>
    <span v-if="crown" class="avatar__crown" aria-hidden="true">
      <DsCrown :size="crownSize" />
    </span>
  </span>
</template>

<style scoped>
.avatar-wrap { position: relative; display: inline-flex; flex: none; }
.avatar__crown {
  position: absolute;
  top: -0.55em;
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,.5));
  color: var(--rank-1);
}
</style>
