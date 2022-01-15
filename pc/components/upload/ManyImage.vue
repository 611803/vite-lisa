<script setup>
import { uploadImage } from 'pc/api/common'
import { ElMessage } from 'element-plus'
import { ref, watch } from 'vue'
import config from '@/config'
import usePreviewStore from 'lisa/pc/store/preview'
import { getImageType, getImagePixel } from 'lisa/utils/file'
import { copy } from 'lisa/utils/func'

const emits = defineEmits(['update:modelValue', 'on-change'])
const props = defineProps({
  modelValue: Array,
  size: Number,
  uploadType: {
    type: String,
    default: 's3', // s3/ipfs
  },
  title: {
    string: '上传图片',
  },
})

const inputRef = ref(null)
const uploadLoading = ref(false)
const list = ref([])
const progress = ref(0)
watch(() => props.modelValue, val => {
  if (JSON.stringify(val) !== JSON.stringify(list.value)) {
    list.value = copy(val)
  }
}, { immediate: true, deep: true })
watch(list, val => {
  emits('update:modelValue', val)
  emits('on-change', val)
}, { deep: true })

const handleClick = () => {
  if (!uploadLoading.value) {
    inputRef.value.value = null
    inputRef.value.click()
  }
}
const handleChange = (e) => {
  const files = e.target.files
  if (!files) return
  uploadFiles(files)
}
const uploadFiles = async (files) => {
  // check type
  const file = files[0]
  // check img type
  const imgType = await getImageType(file, props.imageTypes)
  if (!imgType) {
    ElMessage.error(`图片格式不正确，只允许上传${props.imageTypes.join(', ')}格式的图片`)
    return
  }

  // check source size
  if (props.size && file.size > props.size * 1024 * 1024) {
    ElMessage.error(`上传文件过大，最大允许${props.size}MB`)
    return
  }

  // check image width/height
  if (props.width) {
    const { width, height } = await getImagePixel(file)
    if (width !== props.width || height !== props.height) {
      ElMessage.error(`上传图片尺寸不符，允许尺寸：${props.width}*${props.height}; 所选图片尺寸：${width}*${height}`)
      return
    }
  }

  uploadLoading.value = true
  let data = {}
  if (props.uploadType === 's3') {
    data = {
      file: file,
      type: file.type,
      resize: true,
      s3: true,
    }
  } else {
    data = {
      file: file,
      name: 'jianguo test',
      description: 'test',
      type: file.type,
      resize: true,
      ipfs: true,
    }
  }
  uploadImage(data, {
    timeout: 0,
    onUploadProgress: (e) => {
      if (e.total > 0) {
        const percent = Number(((e.loaded / e.total) * 100).toFixed(2))
        if (percent >= 99) {
          progress.value = 99
        } else {
          progress.value = percent
        }
      }
    },
  }).then(res => {
    progress.value = 100
    let urlObj = {}
    if (props.uploadType === 's3') {
      const url = config.s3Url + res.S3_Url
      urlObj = {
        url: url,
        previewUrl: url,
      }
    }
    list.value.push(urlObj)
    uploadLoading.value = false
  }).catch(_ => {
    uploadLoading.value = false
  })
}

const handleRemove = (index) => {
  list.value.splice(index, 1)
}

const previewStore = usePreviewStore()
const handlePreview = (index) => {
  previewStore.showPreviewImage(list.value.map(x => x.previewUrl), index)
}

</script>

<template>
  <div class="upload-many-image">
    <template v-if="list.length">
      <div class="preview-box" v-for="(item, index) in list" :key="index">
        <img :src="item.previewUrl" class="img">
        <div class="preview-box-handle">
          <el-icon class="handle-icon" @click="handlePreview(index)"><zoom-in /></el-icon>
          <el-icon class="handle-icon" @click="handleRemove(index)"><delete /></el-icon>
        </div>
      </div>
    </template>
    <div class="upload-box" @click="handleClick">
      <el-progress v-if="uploadLoading" class="progress" type="circle" :percentage="progress" />
      <el-icon v-else class="icon-plus"><plus /></el-icon>
    </div>

    <!-- <input type="file" ref="inputRef" name="file" class="upload-input" multiple @change="handleChange"> -->
    <input type="file" ref="inputRef" name="file" class="upload-input" @change="handleChange">
  </div>
</template>

<style lang="scss">
.upload-many-image {
  display: flex;
  flex-wrap: wrap;
  width: 100%;

  .preview-box {
    position: relative;
    box-sizing: border-box;
    width: 100px;
    height: 100px;
    margin-right: 16px;
    overflow: hidden;
    border: 1px solid var(--el-text-color-placeholder);
    border-radius: 4px;

    .img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .preview-box-handle {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 1;
      font-size: 20px;
      color: #fff;
      background-color: #00000080;
      opacity: 0;
      transition: opacity var(--el-transition-duration);

      @include flex-center;

      .handle-icon {
        margin: 0 8px;
        cursor: pointer;
      }

      &:hover {
        opacity: 1;
      }
    }
  }

  .upload-box {
    box-sizing: border-box;
    width: 100px;
    height: 100px;
    cursor: pointer;
    border: 1px dashed var(--el-text-color-placeholder);
    border-radius: 4px;

    @include flex-center;

    .icon-plus {
      font-size: 30px;
      color: var(--el-text-color-secondary);
    }

    .progress {
      width: 90px;
      height: 90px;

      .el-progress-circle {
        width: 100% !important;
        height: 100% !important;
      }
    }

    &:hover {
      border-color: var(--el-color-primary);

      .icon-plus {
        font-size: 32px;
      }
    }
  }

  .upload-input {
    display: none;
  }
}
</style>
