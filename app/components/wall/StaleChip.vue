<script setup lang="ts">
const { generatedAt } = defineProps<{ generatedAt: number }>()

const at = new Date(generatedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
</script>

<template>
  <div class="stale">
    <span class="stale__dot" aria-hidden="true"></span>
    Reconnecting <span class="wdl-num">&nbsp;· {{ at }}</span>
  </div>
</template>
