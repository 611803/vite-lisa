<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
})
const symbolId = computed(() => `#svg-icon-${props.name}`)
</script>

<template>
  <svg aria-hidden="true" class="svg-icon">
    <use :href="symbolId"/>
  </svg>
</template>

<style>
.svg-icon {
  width: 1em;
  height: 1em;
  overflow: hidden;
  font-size: 16px;
  fill: currentColor;
}
</style>
