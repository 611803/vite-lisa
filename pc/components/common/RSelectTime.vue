<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { updateRouteQuery } from 'lisa/pc/utils/func'

const emits = defineEmits(['update:modelValue', 'on-change'])
const props = defineProps({
  modelValue: [Number, null],
  queryKey: {
    type: String,
    default: 'time',
  },
  isQuery: { // 列表页使用
    type: Boolean,
    default: true,
  },
  // 显示在输入框中的格式，也可以控制选择的精确度
  format: {
    type: String,
    default: 'LLL',
  },
  defaultTime: {
    type: String,
    default: '12:00:00',
  },
  placeholder: {
    type: String,
    default: '选择时间',
  },
  allowAfter: { // 是否允许选择之后的年份
    type: Boolean,
    default: true,
  },
})

const route = useRoute()
const router = useRouter()

const selected = ref(null)
const disabledDate = (time) => {
  if (!props.allowAfter) {
    return time.getTime() > Date.now()
  }
  return false
}

watch(() => route.query, n => {
  if (props.isQuery) {
    const time = n[props.queryKey] || null
    if (time !== selected.value) {
      selected.value = time || null
    }
  }
})
watch(() => props.value, n => {
  // 如果input事件中转了格式，这里比较时需要转格式的
  if (n !== selected.value) {
    selected.value = n
  }
}, { immediate: true })

const changeHandle = (val) => {
  if (props.isQuery) {
    // 清空时，值为null，不用处理
    const query = {}
    query[props.queryKey] = val
    updateRouteQuery(route, router, query)
  } else {
    // 普通下拉框数据绑定
    // 可以根据需求转成接口需要的格式
    emits('update:modelValue', val)
    emits('on-change', val)
  }
}

onMounted(() => {
  if (props.isQuery) {
    nextTick(() => {
      const query = route.query
      if (query && query.time) {
        selected.value = query.time
      } else {
        selected.value = null
      }
    })
  }
})
</script>

<template>
  <el-date-picker
    v-model="selected"
    type="datetime"
    value-format="x"
    format="YYYY-MM-DD HH:mm:ss"
    :placeholder="placeholder"
    :disabled-date="disabledDate"
    @change="changeHandle">
  </el-date-picker>
</template>
