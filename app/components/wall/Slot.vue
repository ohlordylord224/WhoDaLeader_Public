<script setup lang="ts">
defineEmits<{ add: [] }>()
</script>

<template>
  <!-- Empty quarter cell rendered when draftCells < 4 in edit mode.
       Tapping opens addNewWidget() via the parent chain. -->
  <section
    class="cell cell--quarter slot"
    role="button"
    tabindex="0"
    aria-label="Add widget"
    @click="$emit('add')"
    @keydown.enter="$emit('add')"
    @keydown.space.prevent="$emit('add')"
  >
    <div class="slot__inner">
      <span class="slot__plus" aria-hidden="true">+</span>
      Add widget
    </div>
  </section>
</template>
