<script setup lang="ts">
import type { Widget, Snapshot, Metric } from '~~/types/widgets'
import { fmtMetric, shortName, deltaDisplay } from '~/utils/format'
import { filterByAudience } from '~/utils/audience'

const props = defineProps<{
  widget:   Widget
  snap:     Snapshot
  prevSnap: Snapshot | null
}>()

const { ownerTeamIds } = useRoster()

const metric = computed(() => props.widget.metric ?? 'revenue')
const size   = computed(() => props.widget.size)

const BOARD_COUNT = { quarter: 3, half: 6, full: 10 } as const
const MAX_ROWS    = 10

const rows = computed(() => {
  const all      = props.snap.aggregates.owner?.[metric.value as Metric] ?? []
  const filtered = filterByAudience(all, props.widget.audience, ownerTeamIds.value)
  const density  = BOARD_COUNT[size.value]
  const limit    = props.widget.limit != null
    ? Math.min(Math.max(1, props.widget.limit), MAX_ROWS, density)
    : density
  return filtered.slice(0, limit)
})

const prevPeriodRows = computed(() =>
  props.snap.trend?.owner?.[metric.value as Metric]
)

// Filter prevSnap by audience so rank-move reflects position within the subset.
const prevSnapRows = computed(() => {
  const all = props.prevSnap?.aggregates.owner?.[metric.value as Metric]
  if (!all) return undefined
  return filterByAudience(all, props.widget.audience, ownerTeamIds.value)
})

const deltas = computed(() =>
  rows.value.map(row => {
    const prev = prevPeriodRows.value?.find(r => r.key === row.key)
    if (!prev) return null
    return deltaDisplay(row.value, prev.value, metric.value as Metric)
  })
)

function rankMove(key: string, index: number): number {
  const prev = prevSnapRows.value
  if (!prev) return 0
  const prevIdx = prev.findIndex(r => r.key === key)
  if (prevIdx === -1) return 0
  return prevIdx - index
}

const celebrating = computed(() =>
  props.widget.celebrate === true &&
  prevSnapRows.value != null &&
  rows.value.length > 0 &&
  prevSnapRows.value.length > 0 &&
  rows.value[0]?.key !== prevSnapRows.value[0]?.key
)

const overtakerFirstName = computed(() =>
  (rows.value[0]?.label ?? '').split(' ')[0] ?? ''
)

const avatarRing = (i: number): 'gold' | 'silver' | 'bronze' | 'up' | null => {
  if (i === 0) return celebrating.value ? 'up' : 'gold'
  if (i === 1) return 'silver'
  if (i === 2) return 'bronze'
  return null
}

// ── Celebration: banner auto-dismisses after 6s; celebrationKey forces
// re-animation (wall-banner-in / wall-pop) on each distinct overtake event.
const bannerVisible  = ref(false)
const celebrationKey = ref(0)
let dismissTimer: ReturnType<typeof setTimeout> | null = null

watch(celebrating, (isNow) => {
  if (isNow) {
    celebrationKey.value++
    bannerVisible.value = true
    if (dismissTimer) clearTimeout(dismissTimer)
    dismissTimer = setTimeout(() => { bannerVisible.value = false }, 6_000)
  }
})

onUnmounted(() => { if (dismissTimer) clearTimeout(dismissTimer) })
</script>

<template>
  <div class="brd" :class="`brd--${size}`">

    <!-- Overtake banner: springs in via wall-banner-in, auto-dismisses 6s.
         :key forces a fresh mount (and animation) on each new overtake. -->
    <div v-if="bannerVisible" :key="celebrationKey" class="ovt" role="status" aria-live="polite">
      <span class="ovt__glyph" aria-hidden="true">▲</span>
      <span>{{ overtakerFirstName }} just took #1</span>
    </div>

    <!-- Empty state -->
    <div v-if="rows.length === 0" class="wdl-empty">
      <p>No data yet — check back when the period kicks off.</p>
    </div>

    <div
      v-for="(row, i) in rows"
      :key="i === 0 && celebrating ? row.key + '-' + celebrationKey : row.key"
      class="brd__row"
      :class="{
        'brd__row--lead':      i === 0 && !celebrating,
        'brd__row--celebrate': i === 0 && celebrating,
      }"
    >
      <DsRankBadge :rank="i + 1" :size="size === 'quarter' ? 'md' : 'lg'" />

      <span
        v-if="size !== 'quarter'"
        class="brd__move"
        :class="`brd__move--${rankMove(row.key, i) > 0 ? 'up' : rankMove(row.key, i) < 0 ? 'down' : 'flat'}`"
      >
        {{ rankMove(row.key, i) > 0 ? '▲' : rankMove(row.key, i) < 0 ? '▼' : '–' }}{{ rankMove(row.key, i) !== 0 ? Math.abs(rankMove(row.key, i)) : '' }}
      </span>

      <!-- Crown stays on the avatar corner throughout celebrate and normal states -->
      <DsAvatar
        :name="row.label"
        :size="size === 'quarter' ? 'md' : 'lg'"
        :ring="avatarRing(i)"
        :crown="i === 0"
      />

      <span class="brd__name">
        <span class="brd__nametext">{{ size === 'quarter' ? shortName(row.label) : row.label }}</span>
      </span>

      <span class="brd__value">{{ fmtMetric(row.value, metric) }}</span>

      <span class="brd__delta">
        <DsTvDelta
          v-if="deltas[i] !== null"
          :value="deltas[i]!.pct"
          :capped="deltas[i]!.capped"
          :pill="i === 0"
        />
      </span>
    </div>

  </div>
</template>
