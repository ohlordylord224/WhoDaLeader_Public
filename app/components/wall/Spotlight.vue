<script setup lang="ts">
import type { Widget, Snapshot, Metric } from '~~/types/widgets'
import { fmtMetric, metricLabel, periodLabel, deltaDisplay } from '~/utils/format'
import { filterByAudience } from '~/utils/audience'

const props = defineProps<{
  widget:   Widget
  snap:     Snapshot
  prevSnap: Snapshot | null
}>()

const { ownerTeamIds } = useRoster()

const metric  = computed(() => props.widget.metric ?? 'activities')
const topRow  = computed(() => {
  const all = props.snap.aggregates.owner?.[metric.value as Metric] ?? []
  return filterByAudience(all, props.widget.audience, ownerTeamIds.value)[0]
})
const prevRow = computed(() =>
  props.snap.trend?.owner?.[metric.value as Metric]?.find(r => r.key === topRow.value?.key)
)

const label   = computed(() => `${metricLabel(metric.value as Metric)} · ${periodLabel(props.snap.period)}`)
const fmtVal  = computed(() => topRow.value ? fmtMetric(topRow.value.value, metric.value as Metric) : '—')
const isShort = computed(() => fmtVal.value.length <= 5)

const deltaResult = computed(() => {
  if (!topRow.value || !prevRow.value) return null
  return deltaDisplay(topRow.value.value, prevRow.value.value, metric.value as Metric)
})
</script>

<template>
  <!-- Empty state when the metric has no data for this period -->
  <div v-if="!topRow" class="wdl-empty">
    <p>Nothing recorded yet — first entry sets the pace.</p>
  </div>

  <div v-else class="spot">
    <span class="wall-eyebrow">{{ label }}</span>
    <span class="spot__value" :class="{ 'spot__value--xl': isShort }">{{ fmtVal }}</span>
    <span class="spot__name">
      <DsAvatar :name="topRow.label" size="lg" ring="gold" :crown="true" />
      {{ topRow.label }}
    </span>
    <DsTvDelta
      v-if="deltaResult !== null"
      :value="deltaResult.pct"
      :capped="deltaResult.capped"
      pill
    />
  </div>
</template>
