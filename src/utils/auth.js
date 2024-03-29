import Cookies from 'js-cookie'

const TokenKey = 'RAINC_JOB_IDENTITY'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token, {
    expires: 7
  })
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
