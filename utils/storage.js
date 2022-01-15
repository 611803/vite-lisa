/*
 * @Descripttion: localStorage
 * @Author: pujianguo
 * @Date: 2021-12-31 14:46:34
 */

const LISA_STORE = 'lisa-store'

export default {
  // setLisaStore
  setLisaStore: payload => {
    window.localStorage.setItem(LISA_STORE, JSON.stringify(payload))
  },
  getLisaStore: () => {
    const res = window.localStorage.getItem(LISA_STORE)
    return res ? JSON.parse(res) : null
  },
  rmLisaStore: () => {
    window.localStorage.removeItem(LISA_STORE)
  },
}
