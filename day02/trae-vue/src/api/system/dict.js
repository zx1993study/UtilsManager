import request from '@/utils/request'

const baseUrl = '/api/v1/dictInfo'

export function getDictList(params) {
  return request({
    url: baseUrl,
    method: 'get',
    params
  })
}

export function getDictDetail(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'get'
  })
}

export function addDict(data) {
  return request({
    url: baseUrl,
    method: 'post',
    data
  })
}

export function updateDict(data) {
  return request({
    url: baseUrl,
    method: 'put',
    data
  })
}

export function deleteDict(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'delete'
  })
}

export function batchDeleteDict(ids) {
  return request({
    url: `${baseUrl}/batch`,
    method: 'delete',
    data: { ids }
  })
}

export function getDictData(params) {
  return getDictList(params)
}
