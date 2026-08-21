<script setup lang="ts">
import type { Widget, Snapshot } from '~~/types/widgets'
import { metricLabel, periodLabel } from '~/utils/format'

const props = defineProps<{
  widget:   Widget
  snap:     Snapshot
  prevSnap: Snapshot | null
}>()

const { rosterTeams } = useRoster()

const AUTO_TITLES: Partial<Record<string, string>> = { ticker: 'Pulse', target: 'Target', trend: 'Trend' }

const cellTitle = computed(() => {
  if (props.widget.title !== undefined) return props.widget.title || null
  if (props.widget.type === 'leaderboard') {
    return props.widget.metric ? metricLabel(props.widget.metric) : 'Leaderboard'
  }
  if (props.widget.type === 'spotlight') return null  // self-labeling via eyebrow
  return AUTO_TITLES[props.widget.type] ?? null
})

// Audience scope segment — appended to subtitle when audience is set.
const audienceSegment = computed<string>(() => {
  const aud = props.widget.audience
  if (!aud) return ''
  if (aud.mode === 'owners') {
    const n = aud.ownerIds.length
    if (n === 0) return ''  // mid-edit transient: mode set but no people selected yet
    return ` · ${n} ${n === 1 ? 'person' : 'people'}`
  }
  // mode === 'team'
  if (aud.teamIds.length === 0) return ''  // mid-edit transient: no teams selected yet
  if (aud.teamIds.length === 1) {
    const name = rosterTeams.value.find(t => t.id === aud.teamIds[0])?.name
    return ` · ${name ?? '1 team'}`
  }
  return ` · ${aud.teamIds.length} teams`
})

// Subtitle line: "{Metric} · {Period}[ · {Audience}]" for metric widgets;
// "Recent wins" for ticker. Spotlight skips — carries its own eyebrow.
const cellSubtitle = computed<string | null>(() => {
  const type = props.widget.type
  if (type === 'spotlight') return null
  if (type === 'ticker')    return 'Recent wins'
  const p = periodLabel(props.snap.period)
  const m = props.widget.metric
  const base = m ? `${metricLabel(m)} · ${p}` : p
  return base + audienceSegment.value
})
</script>

<template>
  <section class="cell" :class="`cell--${widget.size}`" :data-widget-id="widget.id">
    <header v-if="cellTitle || cellSubtitle" class="cell__head">
      <div class="cell__head-stack">
        <h2 v-if="cellTitle" class="cell__title">{{ cellTitle }}</h2>
        <span v-if="cellSubtitle" class="cell__sub">{{ cellSubtitle }}</span>
      </div>
    </header>
    <div class="cell__body">
      <WallLeaderboard v-if="widget.type === 'leaderboard'" :widget="widget" :snap="snap" :prev-snap="prevSnap" />
      <WallSpotlight   v-else-if="widget.type === 'spotlight'" :widget="widget" :snap="snap" :prev-snap="prevSnap" />
      <WallTicker      v-else-if="widget.type === 'ticker'" :snap="snap" />
      <WallTarget      v-else-if="widget.type === 'target'" :snap="snap" />
      <WallTrend       v-else-if="widget.type === 'trend'" :widget="widget" :snap="snap" :prev-snap="prevSnap" />
    </div>
  </section>
</template>
