<script setup>
import { uploadImage } from 'pc/api/common'
import { ElMessage } from 'element-plus'
import { computed, ref, watch } from 'vue'
import config from '@/config'
import usePreviewStore from 'lisa/pc/store/preview'
import { getImageType, getImagePixel } from 'lisa/utils/file'

const emits = defineEmits(['update:modelValue', 'on-change'])
const props = defineProps({
  modelValue: [Object, String],
  meta: [Object, null],
  size: Number,
  dataType: {
    type: String,
    default: 'string', // string/object, when uploadType is ipfs the value must is object
  },
  selectType: {
    type: String,
    default: 'plus', // plus/button
  },
  uploadType: {
    type: String,
    default: 's3', // s3/ipfs/all
  },
  sourceType: {
    type: String,
    default: 'image', // image/video
  },
  width: {
    type: [Number, null],
    default: null,
  },
  height: {
    type: [Number, null],
    default: null,
  },
  title: {
    type: String,
    default: '上传图片',
  },
  imageTypes: {
    type: Array,
    default: () => {
      return ['png', 'jpg', 'gif']
    },
  },
})

const inputRef = ref(null)
const uploadLoading = ref(false)
const url = ref('')
const urlObj = ref({
  url: '',
  previewUrl: '',
})

const progress = ref(0)

watch(() => props.modelValue, val => {
  if (props.dataType === 'string') {
    if (val !== url.value) {
      url.value = val
    }
  } else {
    if (val.url !== urlObj.value.url) {
      urlObj.value = val
    }
  }
}, { immediate: true })
watch(urlObj, val => {
  emits('update:modelValue', val)
  emits('on-change', val)
})
watch(url, val => {
  emits('update:modelValue', val)
  emits('on-change', val)
})

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
  const file = files[0]
  let fileType = file.type
  if (props.sourceType === 'image') {
    // check img type
    const imgType = await getImageType(file, props.imageTypes)
    if (!imgType) {
      ElMessage.error(`图片格式不正确，只允许上传${props.imageTypes.join(', ')}格式的图片`)
      return
    }
    fileType = imgType
  } else if (props.sourceType === 'video') {
    // check video
    if (!file.type.startsWith('video')) {
      ElMessage.error('视频格式不正确')
      return
    }
    fileType = file.name.split('.').pop() || ''
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
      type: fileType,
      resize: props.sourceType === 'image',
      s3: true,
    }
  } else if (props.updateType === 'ipfs') {
    data = {
      file: file,
      name: props.meta?.name || '',
      description: props.meta?.description || '',
      type: fileType,
      resize: props.sourceType === 'image',
      ipfs: true,
    }
  } else {
    data = {
      file: file,
      name: props.meta?.name || '',
      description: props.meta?.description || '',
      type: fileType,
      resize: props.sourceType === 'image',
      s3: true,
      ipfs: true,
    }
  }

  const res = await uploadImage(data, {
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
  })

  if (props.uploadType === 's3') {
    progress.value = 100
    const thisUrl = config.s3Url + res.S3_Url
    if (props.dataType === 'string') {
      url.value = thisUrl
    } else {
      urlObj.value = {
        url: thisUrl,
        previewUrl: thisUrl,
      }
    }
  } else if (props.uploadType === 'ipfs') {
    const ipfs = config.ipfsUrl + res.IPFS_Url
    progress.value = 100
    urlObj.value = {
      url: ipfs,
      previewUrl: ipfs,
    }
  } else {
    progress.value = 100
    const s3 = config.s3Url + res.S3_Url
    const ipfs = config.ipfsUrl + res.IPFS_Url
    urlObj.value = {
      url: ipfs,
      previewUrl: s3,
    }
  }
  uploadLoading.value = false
}

const handleRemove = () => {
  if (props.dataType === 'string') {
    url.value = ''
  } else {
    urlObj.value = {
      url: '',
      previewUrl: '',
    }
  }
}

const previewUrl = computed(() => {
  if (props.dataType === 'string') {
    return url.value
  } else {
    return urlObj.value.previewUrl
  }
})

// preview Image
const previewStore = usePreviewStore()
const handlePreviewImage = () => {
  previewStore.showPreviewImage([previewUrl.value], 0)
}
</script>

<template>
  <div class="upload-one-image">
    <template v-if="props.selectType === 'plus'">
      <div class="preview-box" v-if="previewUrl">
        <img :src="previewUrl" class="img">
        <div class="preview-box-handle">
          <el-icon class="handle-icon" @click="handlePreviewImage"><zoom-in /></el-icon>
          <el-icon class="handle-icon" @click="handleRemove"><delete /></el-icon>
        </div>
      </div>
      <div v-else class="upload-box" @click="handleClick">
        <el-progress v-if="uploadLoading" class="progress" type="circle" :percentage="progress" />
        <el-icon v-else class="icon-plus"><plus /></el-icon>
      </div>
    </template>
    <el-button v-else type="primary" :loading="uploadLoading" @click="handleClick">{{props.title}}</el-button>
    <input class="upload-input" type="file" ref="inputRef" name="file" @change="handleChange">

  </div>
</template>

<style lang="scss">
.upload-one-image {
  display: inline-block;

  .preview-box {
    position: relative;
    box-sizing: border-box;
    width: 100px;
    height: 100px;
    overflow: hidden;
    border: 1px solid var(--el-text-color-placeholder);
    border-radius: 4px;

    .img {
      width: 100px;
      height: 100px;
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
