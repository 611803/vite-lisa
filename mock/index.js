import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { LoginUsers, Users, getUserId } from './data/user'
import { notifyApiErrorInfo } from 'lisa/pc/utils/notification'

import useLisaStore from 'lisa/pc/store/lisa'
let _Users = Users

// let checkPageCurrentDelete = function (num) {
//   let oldPage = Math.ceil(this.listPage.total / this.listPage.size)
//   this.listPage.total -= num
//   let newPage = Math.ceil(this.listPage.total / this.listPage.size)
//   if (oldPage !== newPage && newPage < this.listPage.current) {
//     this.changePage(newPage)
//   } else {
//     this.refresh()
//   }
// }

const request = axios.create({
  baseURL: '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default {
  /**
   * mock bootstrap
   */
  bootstrap () {
    const mock = new MockAdapter(request)

    // mock success request
    mock.onGet('/success').reply(200, {
      msg: 'success',
    })

    // mock error request
    mock.onGet('/error').reply(500, {
      msg: 'failure',
    })

    // login
    mock.onPost('/login').reply(config => {
      const { username, password } = JSON.parse(config.data)
      return new Promise((resolve, reject) => {
        let user = null
        setTimeout(() => {
          const hasUser = LoginUsers.some(u => {
            if (u.username === username && u.password === password) {
              user = JSON.parse(JSON.stringify(u))
              user.password = undefined
              return true
            }
          })

          if (hasUser) {
            resolve([200, { code: 200, msg: 'request success', user }])
          } else {
            resolve([200, { code: 500, msg: 'account or password is error' }])
          }
        }, 1000)
      })
    })

    // get user info
    mock.onGet(/\/users\/\d+/).reply(config => {
      const id = config.url.split('/users/')[1]
      const user = _Users.find(u => u.id === id)
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve([200, {
            data: user,
          }])
        }, 1000)
      })
    })

    // get user list
    mock.onGet('/users').reply(config => {
      const mockUsers = _Users.filter(user => {
        return true
      })
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve([200, {
            items: mockUsers,
          }])
          // resolve([300, {
          //   message: 'params error'
          // }]);
        }, 1000)
      })
    })

    // get user list (page)
    // mock.onGet('/users/page').reply(config => {
    //   let { size, current } = config.params
    //   let mockUsers = JSON.parse(JSON.stringify(_Users))
    //   let total = mockUsers.length
    //   let pageCount = Math.ceil(total / size)
    //   if (current > pageCount) {
    //     current = pageCount
    //   }
    //   mockUsers = mockUsers.filter((u, index) => index < size * current && index >= size * (current - 1))
    //   return new Promise((resolve, reject) => {
    //     setTimeout(() => {
    //       resolve([200, {
    //         current: current,
    //         total: total,
    //         items: mockUsers
    //       }])
    //     }, 1000)
    //   })
    // })
    mock.onGet('/users/page').reply(config => {
      let { limit, offset } = config.params
      limit = Number(limit)
      offset = Number(offset)
      let mockUsers = JSON.parse(JSON.stringify(_Users))
      const total = mockUsers.length
      mockUsers = mockUsers.filter((u, index) => index < offset + limit && index >= offset)
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve([200, {
            total: total,
            items: mockUsers,
          }])
        }, 1000)
      })
    })

    // delete user
    mock.onDelete(/\/users\/\d+/).reply(config => {
      const id = config.url.split('/users/')[1]
      _Users = _Users.filter(u => u.id !== id)
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve([200, {
            code: 200,
            msg: 'delete success',
          }])
        }, 500)
      })
    })

    // batch delete user
    mock.onGet('/users/batchremove').reply(config => {
      let { ids } = config.params
      ids = ids.split(',')
      _Users = _Users.filter(u => !ids.includes(u.id))
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve([200, {
            code: 200,
            msg: 'delete success',
          }])
        }, 500)
      })
    })

    // update user
    mock.onPut(/\/users\/\d+/).reply(config => {
      const id = config.url.split('/users/')[1]
      const { name, addr, age, birth, sex } = JSON.parse(config.data)
      _Users.some(u => {
        if (u.id === id) {
          u.name = name
          u.addr = addr
          u.age = age
          u.birth = birth
          u.sex = sex
          return true
        }
        return false
      })
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve([200, {
            code: 200,
            msg: 'update success',
          }])
        }, 500)
      })
    })

    // add user
    mock.onPost('/users').reply(config => {
      const data = JSON.parse(config.data)
      data.id = getUserId()
      _Users.push(data)
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve([200, {
            code: 200,
            msg: 'add success',
          }])
        }, 500)
      })
    })
  },
}

// white list
const noAuthWhiteList = [
  '/apis/core/v1/login',
  '/apis/core/v1/sign_up',
  '/apis/core/v1/sign_up_code',
]

// request interceptors
request.interceptors.request.use(config => {
  const lisaStore = useLisaStore()
  if (lisaStore.token) {
    config.headers.Authorization = `Bearer ${lisaStore.token}`
  } else {
    const url = config.url || ''
    if (!noAuthWhiteList.includes(url)) {
      toLogin()
      return Promise.reject(new Error('not login'))
    }
  }
  console.log('config', config)
  return config
}, error => {
  return Promise.reject(error)
})

// response interceptors
request.interceptors.response.use(response => {
  return response.data
}, error => {
  let msg = ''
  if (error.response) {
    if (error.response.status === 401) { // no login
      toLogin()
      return
    }
    if (error.response.data && error.response.data.message) {
      msg = error.response.data.message
    } else {
      msg = error.response.data
    }
  } else {
    msg = error.message
  }
  if (msg !== 'not login') {
    notifyApiErrorInfo(msg)
  }
  // console.log('api response error: ', msg)
  console.log('api response error: ', error)
  return Promise.reject(msg)
})

export const toLogin = () => {
  const lisaStore = useLisaStore()
  notifyApiErrorInfo('登录信息已过期，请重新登录')
  lisaStore.setLogout()
  window.location.href = '#/login'
}

export const _get = (url, query) => {
  return request.get(url, { params: query })
}
export const _download = (url, query) => {
  return request.get(url, { params: query, responseType: 'blob' })
}

export const _post = (url, body) => {
  return request.post(url, body)
}

export const _upload = (url, data, config = null) => {
  // return request.post(url, body, { headers: { 'Content-Type': 'multipart/form-data' } })
  return request.post(url, data, { headers: { 'Content-Type': 'multipart/form-data' }, ...config })
}

export const _patch = (url, body) => {
  return request.patch(url, body)
}

export const _put = (url, body) => {
  return request.put(url, body)
}

export const _delete = (url) => {
  return request.delete(url)
}
