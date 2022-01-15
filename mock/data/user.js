import Mock from 'mockjs'
const LoginUsers = [
  {
    id: 1,
    username: 'admin',
    password: '123456',
    avatar: '/images/icon/avatar',
    name: 'Admin',
  },
]

const Users = []

for (let i = 0; i < 86; i++) {
  Users.push(Mock.mock({
    id: Mock.Random.id(),
    name: Mock.Random.cname(),
    addr: Mock.mock('@county(true)'),
    'age|18-60': 1,
    birth: Mock.Random.date(),
    sex: Mock.Random.integer(0, 1),
  }))
}

const getUserId = function () {
  return Mock.Random.guid()
}

export { LoginUsers, Users, getUserId }
