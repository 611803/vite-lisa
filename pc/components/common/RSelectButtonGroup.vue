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
  if (!n) {
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
  <el-button-group>
    <el-button v-for="item in list" :key="item.value"
      :type="active === item.value ? 'primary' : 'default'"
      @click="handleClick(item)">{{item.label}}</el-button>
  </el-button-group>
</template>
