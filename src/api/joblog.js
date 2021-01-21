import request from '@/utils/request'

export function fetchList(params) {
  return request({
    url: 'joblog/',
    method: 'get',
    params
  })
}

export function logKill(params) {
  return request({
    url: 'joblog/logkill',
    method: 'get',
    params
  })
}
