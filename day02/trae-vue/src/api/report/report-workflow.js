import request from '@/utils/request'

/**
 * 工作流报告API
 */

// 获取工作流报告列表
export function getWorkflowReportList(params) {
  return request({
    url: '/report/workflow/list',
    method: 'get',
    params
  })
}

// 获取工作流报告详情
export function getWorkflowReportDetail(id) {
  return request({
    url: `/report/workflow/${id}`,
    method: 'get'
  })
}

// 生成工作流报告
export function generateWorkflowReport(data) {
  return request({
    url: '/report/workflow/generate',
    method: 'post',
    data
  })
}

// 删除工作流报告
export function deleteWorkflowReport(id) {
  return request({
    url: `/report/workflow/${id}`,
    method: 'delete'
  })
}

// 批量删除工作流报告
export function batchDeleteWorkflowReport(ids) {
  return request({
    url: '/report/workflow/batch',
    method: 'delete',
    data: { ids }
  })
}

// 导出工作流报告
export function exportWorkflowReport(id) {
  return request({
    url: `/report/workflow/${id}/export`,
    method: 'get',
    responseType: 'blob'
  })
}
