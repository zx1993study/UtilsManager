import request from '@/utils/request'

/**
 * 页面报告API
 */

// 获取页面报告列表
export function getPageReportList(params) {
  return request({
    url: '/report/page/list',
    method: 'get',
    params
  })
}

// 获取页面报告详情
export function getPageReportDetail(id) {
  return request({
    url: `/report/page/${id}`,
    method: 'get'
  })
}

// 生成页面报告
export function generatePageReport(data) {
  return request({
    url: '/report/page/generate',
    method: 'post',
    data
  })
}

// 删除页面报告
export function deletePageReport(id) {
  return request({
    url: `/report/page/${id}`,
    method: 'delete'
  })
}

// 批量删除页面报告
export function batchDeletePageReport(ids) {
  return request({
    url: '/report/page/batch',
    method: 'delete',
    data: { ids }
  })
}

// 导出页面报告
export function exportPageReport(id) {
  return request({
    url: `/report/page/${id}/export`,
    method: 'get',
    responseType: 'blob'
  })
}
