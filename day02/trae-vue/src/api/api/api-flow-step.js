import request from '@/utils/request'

/**
 * API流程步骤管理API
 */

// 获取步骤列表
export function getFlowStepList(params) {
  return request({
    url: '/api/v1/flowStep/',
    method: 'get',
    params
  })
}

// 根据流程ID获取所有步骤
export function getFlowStepsByFlowId(flowId) {
  return request({
    url: `/api/v1/flowStep/flow/${flowId}`,
    method: 'get'
  })
}

// 获取步骤详情
export function getFlowStepDetail(id) {
  return request({
    url: `/api/v1/flowStep/${id}`,
    method: 'get'
  })
}

// 新增步骤
export function addFlowStep(data) {
  return request({
    url: '/api/v1/flowStep/',
    method: 'post',
    data
  })
}

// 更新步骤
export function updateFlowStep(data) {
  return request({
    url: '/api/v1/flowStep/',
    method: 'put',
    data
  })
}

// 删除步骤
export function deleteFlowStep(id) {
  return request({
    url: `/api/v1/flowStep/${id}`,
    method: 'delete'
  })
}

// 批量删除步骤
export function batchDeleteFlowStep(ids) {
  return request({
    url: '/api/v1/flowStep/batch',
    method: 'delete',
    data: { ids }
  })
}
