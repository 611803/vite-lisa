<template>
  <div class="r-empty">
    <img class="r-empty-img" :style="`width: ${props.width}px`" src="lisa/assets/images/nodata.png" v-if="!props.noImage">
    <div class="r-empty-text">
      <slot>暂无数据</slot>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  noImage: {
    type: Boolean,
    default: false,
  },
  width: Number,
})
</script>

<style lang="scss">
// 请保证父组件有定位
.r-empty {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 20px;

  @include flex-center(column);

  &-img {
    width: 100px;
    margin-bottom: 10px;
  }

  &-text {
    font-size: 14px;
    line-height: 2em;
    color: #a3a3a3;
  }
}
</style>
