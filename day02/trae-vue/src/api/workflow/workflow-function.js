import request from '@/utils/request'

/**
 * 工作流功能API
 */

// 获取工作流功能列表
export function getWorkflowFunctionList(params) {
  return request({
    url: '/workflow/function/list',
    method: 'get',
    params
  })
}

// 获取工作流功能详情
export function getWorkflowFunctionDetail(id) {
  return request({
    url: `/workflow/function/${id}`,
    method: 'get'
  })
}

// 新增工作流功能
export function addWorkflowFunction(data) {
  return request({
    url: '/workflow/function',
    method: 'post',
    data
  })
}

// 更新工作流功能
export function updateWorkflowFunction(data) {
  return request({
    url: '/workflow/function',
    method: 'put',
    data
  })
}

// 删除工作流功能
export function deleteWorkflowFunction(id) {
  return request({
    url: `/workflow/function/${id}`,
    method: 'delete'
  })
}

// 批量删除工作流功能
export function batchDeleteWorkflowFunction(ids) {
  return request({
    url: '/workflow/function/batch',
    method: 'delete',
    data: { ids }
  })
}
