import request from '@/utils/request'

export function fetchList(params) {
  return request({
    url: '/jobgroup/list',
    method: 'get',
    params
  })
}
export function fetchAll() {
  return request({
    url: '/jobgroup/',
    method: 'get'
  })
}
export function fetchExecutorCount() {
  return request({
    url: '/jobgroup/executor/count',
    method: 'get'
  })
}
export function add(data) {
  data.addressList = data.addressList.toString()
  return request({
    url: '/jobgroup/',
    method: 'post',
    data
  })
}
export function update(data) {
  data.addressList = data.addressList.toString()
  return request({
    url: '/jobgroup/',
    method: 'put',
    data
  })
}

export function remove(id) {
  return request({
    url: '/jobgroup/' + id,
    method: 'delete'
  })
}

export function fetchAppNameList() {
  return request({
    url: '/jobgroup/appname',
    method: 'get'
  })
}

export function fetchAddressList(appName) {
  return request({
    url: '/jobgroup/address/{appName}'.replace('{appName}', appName),
    method: 'get'
  })
}
