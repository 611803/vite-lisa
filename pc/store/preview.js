/*
 * @Descripttion: 预览图片状态管理
 * @Author: pujianguo
 * @Date: 2022-01-07 16:02:22
 */
import { defineStore } from 'pinia'

const usePreviewStore = defineStore({
  id: 'preview',
  state: () => ({
    previewImageList: [],
    previewImageCurrent: 0,
    previewImageVisible: false,
  }),
  actions: {
    showPreviewImage (list, index) {
      this.$state.previewImageList = list
      this.$state.previewImageCurrent = index
      this.$state.previewImageVisible = true
    },
    setPreviewImageVisible (payload) {
      this.$state.previewImageVisible = payload
    },
    setPreviewImageList (payload) {
      this.$state.previewImageList = payload
    },
    setPreviewImageCurrent (payload) {
      this.$state.previewImageCurrent = payload
    },
  },

})
export default usePreviewStore
