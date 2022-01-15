<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
})
const symbolId = computed(() => `#svg-img-${props.name}`)
</script>

<template>
  <svg aria-hidden="true">
    <use :href="symbolId"/>
  </svg>
</template>
