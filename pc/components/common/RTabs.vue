<script setup>
import { ref, watch } from 'vue'

const emits = defineEmits(['update:modelValue', 'on-change'])
const props = defineProps({
  modelValue: [String, Number],
  list: Array,
  isSetFirst: {
    type: Boolean,
    default: false,
  },
})

const active = ref('')

const handleClick = (item) => {
  if (active.value !== item.value) {
    active.value = item.value
    emits('update:modelValue', active.value)
    emits('on-change', item)
  }
}

watch(() => props.modelValue, n => {
  if (n === '') {
    if (props.isSetFirst) {
      handleClick(props.list[0])
    }
  } else {
    if (n !== active.value) {
      active.value = n
    }
  }
}, { immediate: true })

</script>

<template>
  <div class="r-tabs">
    <div v-for="item in list" :key="item.value"
      class="item" :class="{active: active === item.value}"
      @click="handleClick(item)"
    >{{item.label}}</div>
  </div>
</template>

<style lang="scss">
.r-tabs {
  padding: 16px 16px 0;
  background: #e4ebf1;

  .item {
    display: inline-block;
    padding: 10px 18px;
    margin-right: 5px;
    font-size: 12px;
    color: #324558;
    cursor: pointer;
    background: #d5e0e9;
    border-radius: 3px 3px 0 0;

    &:hover {
      background: #c6d5e1;
    }

    &.active {
      font-weight: bold;
      background: #fff;
    }
  }
}
</style>
