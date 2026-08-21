<script setup lang="ts">
import type { Snapshot } from '~~/types/widgets'
import { fmtDate } from '~/utils/format'

const { snap } = defineProps<{ snap: Snapshot }>()

const events = computed(() =>
  [...(snap.events ?? [])].sort((a, b) => b.ts - a.ts).slice(0, 5)
)

const tone = (kind: string) => (kind === 'deal' ? 'up' : 'sky')
</script>

<template>
  <div class="tick" :class="{ 'tick--empty': !events.length }">
    <p v-if="!events.length">No deals yet today — first one sets the pace.</p>
    <template v-else>
      <div v-for="ev in events" :key="ev.ts" class="tick__row">
        <span class="tick__dot" :class="`tick__dot--${tone(ev.kind)}`"></span>
        <span class="tick__text">{{ ev.text }}</span>
        <span class="tick__time wdl-num">{{ fmtDate(ev.ts) }}</span>
      </div>
    </template>
  </div>
</template>
