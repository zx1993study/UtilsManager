import request from '@/utils/request'

/**
 * 工作流测试结果API
 */

// 获取工作流测试结果列表
export function getWorkflowResultList(params) {
  return request({
    url: '/workflow/result/list',
    method: 'get',
    params
  })
}

// 获取工作流测试结果详情
export function getWorkflowResultDetail(id) {
  return request({
    url: `/workflow/result/${id}`,
    method: 'get'
  })
}

// 删除工作流测试结果
export function deleteWorkflowResult(id) {
  return request({
    url: `/workflow/result/${id}`,
    method: 'delete'
  })
}

// 批量删除工作流测试结果
export function batchDeleteWorkflowResult(ids) {
  return request({
    url: '/workflow/result/batch',
    method: 'delete',
    data: { ids }
  })
}

// 清空工作流测试结果
export function clearWorkflowResults() {
  return request({
    url: '/workflow/result/clear',
    method: 'delete'
  })
}
