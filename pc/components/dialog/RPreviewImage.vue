<script setup>
/**
 * TODO:
 * 1. 展示图片信息
 * 2. 图片切换loading
 * 3. esc关闭弹框
 */
import { computed, onMounted, ref, watch } from 'vue'
import usePreviewStore from 'lisa/pc/store/preview'

const previewStore = usePreviewStore()

const visible = computed(() => {
  return previewStore.previewImageVisible
})
const list = computed(() => {
  return previewStore.previewImageList
})
const currentIndex = computed(() => {
  return previewStore.previewImageCurrent
})
const currentUrl = computed(() => {
  if (!list.value.length) {
    return ''
  }
  return list.value[currentIndex.value]
})

watch(visible, val => {
  if (val) {
    resetStyle()
  }
})

const handleClose = () => {
  previewStore.setPreviewImageVisible(false)
}
const afterEnter = () => {
}
const afterLeave = () => {
}

// change image index
const prevSwitchDisabled = computed(() => {
  return currentIndex.value === 0
})
const nextSwitchDisabled = computed(() => {
  return currentIndex.value === list.value.length - 1
})
const handlePrev = () => {
  if (currentIndex.value > 0) {
    previewStore.setPreviewImageCurrent(currentIndex.value - 1)
  }
}
const handleNext = () => {
  if (currentIndex.value < previewStore.previewImageList.length - 1) {
    previewStore.setPreviewImageCurrent(currentIndex.value + 1)
  }
}

// set style
const rotate = ref(0)
const handleRotateLeft = () => {
  rotate.value -= 90
}
const handleRotateRight = () => {
  rotate.value += 90
}
const scale = ref(1)
const scaleMinusDisabled = ref(false)
const handleScaleMinus = () => {
  if (scale.value === 1) {
    scale.value = 0.5
    scaleMinusDisabled.value = true
  } else if (scale.value > 1) {
    scale.value--
  }
}
const handleScalePlus = () => {
  if (scale.value === 0.5) {
    scale.value = 1
    scaleMinusDisabled.value = false
  } else {
    scale.value++
  }
}
const imageStyle = computed(() => {
  return `transform: scale3d(${scale.value}, ${scale.value}, 1) rotate(${rotate.value}deg)`
})
const resetStyle = () => {
  scale.value = 1
  rotate.value = 0
}

const imgRef = ref(null)

onMounted(() => {
  // // TODO: 切换图片后获取图片基本信息
  // imgRef.value.addEventListener('load', (e) => {
  //   const img = e.target
  //   console.log('img info', img.width, img.height)
  // })
})

</script>

<template>
  <teleport to="body">
    <transition
      name="dialog-zoom"
      :appear="true"
      @after-enter="afterEnter"
      @after-leave="afterLeave">
      <div class="preview-image-wrap" v-show="visible">
        <div class="preview-image-mask"></div>
        <div class="preview-image" @click="handleClose">
          <ul class="preview-image-handle" @click.stop>
            <li class="preview-image-handle-item" @click="handleRotateLeft"><i class="iconfont icon-rotate-left"></i></li>
            <li class="preview-image-handle-item" @click="handleRotateRight"><i class="iconfont icon-rotate-right"></i></li>
            <li class="preview-image-handle-item" :class="{'preview-image-handle-item-disabled': scaleMinusDisabled}" @click="handleScaleMinus"><i class="iconfont icon-zoomout"></i></li>
            <li class="preview-image-handle-item" @click="handleScalePlus"><i class="iconfont icon-zoomin"></i></li>
            <li class="preview-image-handle-item" @click="handleClose"><i class="iconfont icon-close"></i></li>
          </ul>
          <div class="preview-image-content">
            <img class="preview-image-content-img" @click.stop ref="imgRef"
              :src="currentUrl" :style="imageStyle" alt="">
          </div>
          <div v-show="list.length > 1" class="preview-image-switch-left" :class="{'preview-image-switch-disabled': prevSwitchDisabled}" @click.stop="handlePrev">
            <i class="iconfont icon-left"></i>
          </div>
          <div v-show="list.length > 1" class="preview-image-switch-right" :class="{'preview-image-switch-disabled': nextSwitchDisabled}" @click.stop="handleNext">
            <i class="iconfont icon-right"></i>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style lang="scss">
.preview-image-wrap {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 99999;

  .preview-image-mask {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1;
    background: rgb(0 0 0 / 45%);
  }

  .preview-image {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 2;
    background: transparent;

    .preview-image-handle {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      width: 100%;
      height: 46px;
      margin: 0;
      color: rgb(255 255 255 / 85%);
      background: rgb(0 0 0 / 10%);

      &-item {
        padding: 0 10px;
        margin-left: 15px;
        font-size: 18px;
        cursor: pointer;

        .lisafont {
          font-size: 24px;
        }
      }

      &-item-disabled {
        color: rgb(255 255 255 / 45%);
        cursor: not-allowed;
      }
    }

    .preview-image-content {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;

      .preview-image-content-img {
        max-width: 90%;
        max-height: 90%;
        pointer-events: auto;
        cursor: grab;
        user-select: none;
        transition: transform .3s cubic-bezier(.215, .61, .355, 1) 0s;
        transform: scale3d(1, 1, 1) rotate(0);
      }
    }

    .preview-image-switch-left,
    .preview-image-switch-right {
      position: absolute;
      top: 50%;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      margin-top: -22px;
      font-size: 18px;
      color: rgb(255 255 255 / 85%);
      pointer-events: auto;
      cursor: pointer;
      background: rgb(0 0 0 / 10%);
      border-radius: 50%;

      .lisafont {
        font-size: 24px;
      }
    }

    .preview-image-switch-disabled {
      color: rgb(255 255 255 / 45%);
      cursor: not-allowed;
    }

    .preview-image-switch-left {
      left: 10px;
    }

    .preview-image-switch-right {
      right: 10px;
    }
  }
}
</style>
