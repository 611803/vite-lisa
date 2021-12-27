/*
 * @Descripttion: 公共方法
 * @Author: pujianguo
 * @Date: 2021-04-02 09:41:58
 */

import { ElMessageBox } from 'element-plus'

// 确认执行dialog
export const confirmExecHandle = (title, text, callback, cancelCallBack = null) => {
  return ElMessageBox.confirm(text, title, {
    type: 'warning',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true
        instance.confirmButtonText = '执行中...'
        instance.showClose = false
        instance.closeOnClickModal = false
        instance.closeOnPressEscape = false
        instance.showCancelButton = false

        callback().finally(() => {
          done()
          setTimeout(() => {
            instance.confirmButtonLoading = false
          }, 300)
        })
      } else {
        done()
        // ElMessage.info('取消操作')
        cancelCallBack && cancelCallBack()
      }
    },
  }).then(() => { // 在 beforeClose 中已经对then和catch后的事件做了处理，then可省略； 省略catch时，点击取消会提示错误
  }).catch(() => {
  })
}
// confirmExecHandle 使用示例：
// confirmExecHandle('提示', '此操作将删除xxx，是否继续？', () => {
//   return new Promise((resolve, reject) => {
//     setTimeout(Math.random() > 0.5 ? resolve : reject, 1000)
//   }).catch(_ => console.log('Oops errors!'))
// })

/** *************** table route相关 *************** **/
export const getRouteQuery = (query) => {
  const q = Object.assign({}, query)
  delete q.t
  // 根据需要做转换
  // if (q.store_ids) {
  //   q.store_ids = q.store_ids.split(',')
  // }
  // 根据需要做转换
  // if (q.begin_time) {
  //   q.begin_time = format('submitTime', q.begin_time)
  // }
  // if (q.end_time) {
  //   q.end_time = format('submitTime', q.end_time)
  // }
  return q
}
export const updateRouteQuery = (route, router, store, obj, clearOtherQuery = false) => {
  let q // 最后设置的query
  let s // 最后保存在store中的query
  let isPage = true
  // 不含分页的query
  if (!obj.hasOwnProperty('offset') && route.query.offset !== undefined) {
    if (clearOtherQuery) {
      s = Object.assign({ limit: 10, offset: 0, current: 1, total: 0 }, obj)
      q = Object.assign({ limit: 10, offset: 0 }, obj)
    } else {
      isPage = false
      s = Object.assign({}, route.query, obj, { offset: 0, current: 1 })
      q = Object.assign({}, route.query, obj, { offset: 0 })
    }
  } else { // 分页相关
    s = Object.assign({}, route.query, obj)
    // 路由里面不用存放current 和 total
    delete obj.current
    delete obj.total
    q = Object.assign({}, route.query, obj)
  }
  delete s.t

  // 清除q中的null，s中的null不清除无影响
  for (const k in q) {
    if (q[k] === null) {
      delete q[k]
    }
  }

  // 保存到store中
  store.commit('lisa/SET_PAGE_OPTION', {
    routerName: route.name,
    isPage: isPage,
    data: s,
  })
  q.t = (new Date()).getTime()
  router.replace({ query: q })
}
export const clearRouteQuery = (router, store, routerName) => {
  store.commit('lisa/CLEAR_PAGE_OPTION', routerName)
  router.replace({ query: {} })
}
