<script setup lang="ts">
defineProps<{
  count:     number
  activeIdx: number
  paused:    boolean
}>()

defineEmits<{
  prev:   []
  next:   []
  goTo:   [idx: number]
  toggle: []
}>()
</script>

<template>
  <div
    v-if="count > 1"
    class="rotation-bar"
    :class="{ 'rotation-bar--paused': paused }"
    role="group"
    aria-label="Dashboard rotation controls"
  >
    <button
      class="rotation-btn"
      aria-label="Previous dashboard"
      @click="$emit('prev')"
    >‹</button>

    <div class="rotation-dots" role="tablist">
      <button
        v-for="i in count"
        :key="i"
        class="rotation-dot"
        :class="{ 'rotation-dot--active': i - 1 === activeIdx }"
        role="tab"
        :aria-label="`Dashboard ${i}`"
        :aria-selected="i - 1 === activeIdx"
        @click="$emit('goTo', i - 1)"
      />
    </div>

    <button
      class="rotation-btn"
      aria-label="Next dashboard"
      @click="$emit('next')"
    >›</button>

    <button
      class="rotation-btn rotation-btn--pause"
      :aria-label="paused ? 'Resume rotation' : 'Pause rotation'"
      @click="$emit('toggle')"
    >{{ paused ? '▶' : '⏸' }}</button>
  </div>
</template>
