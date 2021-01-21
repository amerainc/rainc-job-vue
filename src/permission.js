import router from './router'
import store from './store'
import {
  Message
} from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import {
  getToken
} from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({
  showSpinner: false
}) // NProgress Configuration

const whiteList = ['/login'] // no redirect whitelist

router.beforeEach(async(to, from, next) => {
  // 进度条开始
  NProgress.start()

  // 设置页面标题
  document.title = getPageTitle(to.meta.title)

  // 判断用户是否登录
  const hasToken = getToken()
  if (hasToken) {
    // 如果已经登录
    if (to.path === '/login') {
      // 如果是login页面，则重定向到主页
      next({
        path: '/'
      })
      // 停止进度条
      NProgress.done()
    } else {
      // 否则获取用户信息
      const hasRole = store.getters.role != null && store.getters.role >= 0
      if (hasRole) {
        // 如果有用户信息则放行
        next()
      } else {
        // 否则尝试获取用户信息
        try {
          // get user info
          // note: roles must be a object array! such as: ['admin'] or ,['developer','editor']
          const {
            role
          } = await store.dispatch('user/getInfo')

          // 生成动态侧边栏
          const accessRoutes = await store.dispatch('permission/generateRoutes', role)
          // 添加动态侧边栏
          router.addRoutes(accessRoutes)
          // hack method to ensure that addRoutes is complete
          // set the replace: true, so the navigation will not leave a history record
          next({
            ...to,
            replace: true
          })
        } catch (error) {
          // 失败则重置token并提示错误
          await store.dispatch('user/resetToken')
          Message.error(error || 'Has Error')
          // 跳转至登录
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    // 如果没有登录
    if (whiteList.indexOf(to.path) !== -1) {
      // 如果是白名单比如登录则直接放行
      next()
    } else {
      // 否则重定向至登录
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
