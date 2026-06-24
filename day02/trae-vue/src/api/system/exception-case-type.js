import request from '@/utils/request'

const baseUrl = '/api/v1/exceptionCaseType'

export function getExceptionCaseTypeList(params) {
  return request({
    url: baseUrl,
    method: 'get',
    params
  })
}

export function getExceptionCaseTypeDetail(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'get'
  })
}

export function addExceptionCaseType(data) {
  return request({
    url: baseUrl,
    method: 'post',
    data
  })
}

export function updateExceptionCaseType(data) {
  return request({
    url: baseUrl,
    method: 'put',
    data
  })
}

export function deleteExceptionCaseType(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'delete'
  })
}

export function batchDeleteExceptionCaseType(ids) {
  return request({
    url: `${baseUrl}/batch`,
    method: 'delete',
    data: { ids }
  })
}
