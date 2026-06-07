import request from '@/utils/request'

/**
 * API流程管理API
 */

// 获取流程列表
export function getFlowList(params) {
  return request({
    url: '/api/v1/flowInfo/',
    method: 'get',
    params
  })
}

// 获取流程详情
export function getFlowDetail(id) {
  return request({
    url: `/api/v1/flowInfo/${id}`,
    method: 'get'
  })
}

// 新增流程
export function addFlow(data) {
  return request({
    url: '/api/v1/flowInfo/',
    method: 'post',
    data
  })
}

// 更新流程
export function updateFlow(data) {
  return request({
    url: '/api/v1/flowInfo/',
    method: 'put',
    data
  })
}

// 删除流程
export function deleteFlow(id) {
  return request({
    url: `/api/v1/flowInfo/${id}`,
    method: 'delete'
  })
}

// 批量删除流程
export function batchDeleteFlow(ids) {
  return request({
    url: '/api/v1/flowInfo/batch',
    method: 'delete',
    data: { ids }
  })
}
