import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

export function getInfo() {
  return request({
    url: '/user/info',
    method: 'get'
  })
}
export function fetchList(params) {
  return request({
    url: '/user/list',
    method: 'get',
    params
  })
}

export function add(data) {
  data.permission = data.permission.toString()
  return request({
    url: '/user/',
    method: 'post',
    data
  })
}

export function update(data) {
  data.permission = data.permission.toString()
  return request({
    url: '/user/',
    method: 'put',
    data
  })
}
export function remove(id) {
  return request({
    url: '/user/' + id,
    method: 'delete'
  })
}
