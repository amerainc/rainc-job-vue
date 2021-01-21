import {
  login,
  getInfo
} from '@/api/user'
import {
  getToken,
  setToken,
  removeToken
} from '@/utils/auth'
import {
  resetRouter
} from '@/router'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    role: -1
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_ROLE: (state, role) => {
    state.role = role
  }
}

const actions = {
  // 用户登录
  login({
    commit
  }, userInfo) {
    // 取出用户名和密码
    const {
      username,
      password
    } = userInfo
    // 异步事件
    return new Promise((resolve, reject) => {
      login({
        username: username.trim(),
        password: password
      }).then(response => {
        const {
          content
        } = response
        // 将token存储vue
        commit('SET_TOKEN', content)
        // 存入cookie
        setToken(content)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({
    commit
  }) {
    return new Promise((resolve, reject) => {
      getInfo().then(response => {
        const {
          content
        } = response

        if (!content) {
          return reject('验证失败，请重新登录')
        }

        const {
          username,
          role
        } = content
        commit('SET_NAME', username)
        commit('SET_ROLE', role)
        resolve(content)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({
    commit,
    state
  }) {
    return new Promise((resolve, reject) => {
      // logout(state.token).then(() => {

      // }).catch(error => {
      //   reject(error)
      // })
      removeToken() // must remove  token  first
      resetRouter()
      commit('RESET_STATE')
      resolve()
    })
  },

  // remove token
  resetToken({
    commit
  }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
