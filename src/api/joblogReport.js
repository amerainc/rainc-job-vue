import request from '@/utils/request'

export function fetchCount() {
  return request({
    url: '/joblog/report/count',
    method: 'get'
  })
}
export function fetchList(params) {
  return request({
    url: '/joblog/report/list',
    method: 'get',
    params
  })
}
