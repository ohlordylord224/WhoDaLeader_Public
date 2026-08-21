<script setup lang="ts">
import type { Widget, Snapshot, Metric, Aggregates } from '~~/types/widgets'
import { fmtMetric } from '~/utils/format'
import { filterByAudience } from '~/utils/audience'

const props = defineProps<{
  widget:   Widget
  snap:     Snapshot
  prevSnap: Snapshot | null
}>()

const { ownerTeamIds } = useRoster()

const metric = computed(() => (props.widget.metric ?? 'revenue') as Metric)

// When audience is set, sum the filtered subset's owner rows instead of the
// team total (which always covers all tracked owners).
function audiencedTotal(agg: Aggregates | null | undefined): number | null {
  if (!agg) return null
  if (!props.widget.audience) return agg.team?.[metric.value] ?? null
  const rows     = agg.owner?.[metric.value] ?? []
  const filtered = filterByAudience(rows, props.widget.audience, ownerTeamIds.value)
  if (!filtered.length) return null
  return filtered.reduce((sum, r) => sum + r.value, 0)
}

const teamNow  = computed(() => audiencedTotal(props.snap.aggregates))
const teamPrev = computed(() => audiencedTotal(props.snap.trend))

const delta = computed(() => {
  if (teamNow.value === null || !teamPrev.value || teamPrev.value === 0) return null
  return ((teamNow.value - teamPrev.value) / teamPrev.value) * 100
})
</script>

<template>
  <div class="trend">
    <div class="trend__hero">
      <div class="trend__stat">
        <span class="trend__key">
          <i class="trend__sw trend__sw--now"></i>
          <span class="wall-eyebrow">This {{ snap.period }}</span>
        </span>
        <span class="trend__big">{{ teamNow !== null ? fmtMetric(teamNow, metric) : '—' }}</span>
      </div>
      <div class="trend__stat trend__stat--prev">
        <span class="trend__key">
          <i class="trend__sw trend__sw--prev"></i>
          <span class="wall-eyebrow">Last {{ snap.period }}</span>
        </span>
        <span class="trend__big">{{ teamPrev !== null ? fmtMetric(teamPrev, metric) : '—' }}</span>
      </div>
      <DsTvDelta v-if="delta !== null" :value="delta" pill lg />
    </div>
    <!-- Daily bars grow as snapshot history accumulates (~30 days) -->
    <div class="wdl-empty">
      <p>Daily bars accumulate as history builds.</p>
    </div>
  </div>
</template>
