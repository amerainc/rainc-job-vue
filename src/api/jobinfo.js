import request from '@/utils/request'

export function fetchList(params) {
  return request({
    url: 'jobinfo/list',
    method: 'get',
    params
  })
}
export function fetchAll(params) {
  return request({
    url: 'jobinfo/',
    method: 'get',
    params
  })
}
export function status(params) {
  const {
    id,
    triggerStatus
  } = params
  return request({
    url: 'jobinfo/' + triggerStatus + '/' + id,
    method: 'get'
  })
}
export function trigger(id) {
  return request({
    url: 'jobinfo/trigger/' + id,
    method: 'get'
  })
}
export function fetchBlockStrategy() {
  return request({
    url: '/jobinfo/block_strategy',
    method: 'get'
  })
}
export function fetchRouterStrategy() {
  return request({
    url: '/jobinfo/router_strategy',
    method: 'get'
  })
}
export function fetchHandlers(groupId) {
  return request({
    url: '/jobinfo/handlers/' + groupId,
    method: 'get'
  })
}

export function fetchCount() {
  return request({
    url: '/jobinfo/count',
    method: 'get'
  })
}

export function add(data) {
  return request({
    url: '/jobinfo/',
    method: 'post',
    data
  })
}

export function update(data) {
  return request({
    url: '/jobinfo/',
    method: 'put',
    data
  })
}

export function remove(id) {
  return request({
    url: '/jobinfo/' + id,
    method: 'delete'
  })
}
