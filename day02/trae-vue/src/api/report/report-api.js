import request from '@/utils/request'

/**
 * 接口报告API
 */

// 获取接口报告列表
export function getApiReportList(params) {
  return request({
    url: '/report/api/list',
    method: 'get',
    params
  })
}

// 获取接口报告详情
export function getApiReportDetail(id) {
  return request({
    url: `/report/api/${id}`,
    method: 'get'
  })
}

// 生成接口报告
export function generateApiReport(data) {
  return request({
    url: '/report/api/generate',
    method: 'post',
    data
  })
}

// 删除接口报告
export function deleteApiReport(id) {
  return request({
    url: `/report/api/${id}`,
    method: 'delete'
  })
}

// 批量删除接口报告
export function batchDeleteApiReport(ids) {
  return request({
    url: '/report/api/batch',
    method: 'delete',
    data: { ids }
  })
}

// 导出接口报告
export function exportApiReport(id) {
  return request({
    url: `/report/api/${id}/export`,
    method: 'get',
    responseType: 'blob'
  })
}
