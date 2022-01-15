/*
 * @Descripttion: 状态管理
 * @Author: pujianguo
 * @Date: 2021-12-28 02:04:06
 */
import { defineStore } from 'pinia'
import storage from 'lisa/utils/storage'

const useLisaStore = defineStore({
  id: 'lisa',
  state: () => ({
    token: '',
    userInfo: {},
    menuCollapsed: false,
    pageOption: {},
    pageSize: 10,

  }),
  getters: {
    // total (state) {
    //   const counter = useCounterStore()
    //   return counter.number * state.money
    // },
  },
  actions: {
    setPageSize (payload) {
      this.$state.pageSize = payload
    },
    setLogin ({ token, ...user }) {
      this.$state.token = token
      this.$state.userInfo = user
    },
    setLogout () {
      this.$state.token = ''
      this.$state.userInfo = {}
    },
    // 设置菜单收缩
    setMenuCollapsed (payload) {
      this.$state.menuCollapsed = payload
    },
    setPageOption ({ routerName, data, isPage }) {
      let option = this.$state.pageOption[routerName] ? this.$state.pageOption[routerName] : {}
      if (isPage) {
        option = data
      } else {
        option = Object.assign({}, option, data)
      }
      this.$state.pageOption[routerName] = option
    },
    clearPageOption (routerName) {
      delete this.$state.pageOption[routerName]
    },
  },

})

export const initLisaStore = () => {
  const instance = useLisaStore()
  // listen hooks
  instance.$subscribe((mutation, state) => {
    // save
    storage.setLisaStore(state)
  })
  // recover
  const re = storage.getLisaStore()
  if (re) {
    instance.$patch({
      ...re,
    })
  }
}

export default useLisaStore
