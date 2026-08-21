<script setup lang="ts">
import type { Snapshot } from '~~/types/widgets'

defineProps<{ snap: Snapshot }>()
// Target/goal value requires settings-layer config (future task).
</script>

<template>
  <div class="wdl-empty">
    <p>No target configured — set one in settings.</p>
  </div>
</template>
