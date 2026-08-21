<script setup lang="ts">
import type { Screen, Snapshot, Size } from '~~/types/widgets'
import { periodLabel } from '~/utils/format'

const props = defineProps<{
  screen:       Screen
  snap:         Snapshot
  prevSnap:     Snapshot | null
  editMode?:    boolean
  activeDashId?: string   // prefix for composite cell key — forces remount on rotation
  dashCount?:   number
  activeIdx?:   number
  rotPaused?:   boolean
}>()

defineEmits<{
  addSlot:   []
  rotPrev:   []
  rotNext:   []
  rotGoTo:   [idx: number]
  rotToggle: []
}>()

const clock = ref('')
let timer: ReturnType<typeof setInterval>
function tick() {
  clock.value = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}
onMounted(() => { tick(); timer = setInterval(tick, 1000) })
onUnmounted(() => clearInterval(timer))

const CELL_SIZES: Record<Size, number> = { full: 4, half: 2, quarter: 1 }

// Number of empty quarter slots to render in edit mode when the displayed
// widget set sums to fewer than 4 cells. Each slot = 1 quarter cell.
const freeCells = computed(() => {
  if (!props.editMode) return 0
  const used = props.screen.widgets.reduce((s, w) => s + (CELL_SIZES[w.size] ?? 0), 0)
  return Math.max(0, 4 - used)
})
</script>

<template>
  <div class="wall">
    <header class="wall__head">
      <div class="wall__brand">
        <img src="/emblem.svg" alt="Whosdaleader" width="56" height="56" />
        <span class="wall__wordmark">Whos<span class="wall__da">da</span>leader</span>
      </div>
      <div class="wall__meta">
        <span class="wall__period">{{ periodLabel(snap.period) }}</span>
        <span class="wall__div"></span>
        <span class="wall__clock wdl-num">{{ clock }}</span>
        <span class="live-badge">LIVE</span>
      </div>
    </header>

    <!-- Edit mode: TransitionGroup drives reflow slide animations.
         Display mode: plain <main> so SSE layout changes are instant. -->
    <TransitionGroup v-if="editMode" name="reflow" tag="main" class="wall__grid">
      <WallCell
        v-for="w in screen.widgets"
        :key="`${activeDashId ?? ''}:${w.id}`"
        :widget="w"
        :snap="snap"
        :prev-snap="prevSnap"
      />
      <WallSlot
        v-for="i in freeCells"
        :key="`slot-${i}`"
        @add="$emit('addSlot')"
      />
    </TransitionGroup>
    <main v-else class="wall__grid">
      <WallCell
        v-for="w in screen.widgets"
        :key="`${activeDashId ?? ''}:${w.id}`"
        :widget="w"
        :snap="snap"
        :prev-snap="prevSnap"
      />
    </main>

    <WallStaleChip v-if="snap.stale" :generated-at="snap.generatedAt" />

    <WallRotationDots
      v-if="!editMode"
      :count="dashCount ?? 0"
      :active-idx="activeIdx ?? 0"
      :paused="rotPaused ?? false"
      @prev="$emit('rotPrev')"
      @next="$emit('rotNext')"
      @go-to="(i) => $emit('rotGoTo', i)"
      @toggle="$emit('rotToggle')"
    />
  </div>
</template>
