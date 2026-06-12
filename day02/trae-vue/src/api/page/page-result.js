import request from '@/utils/request'

/**
 * 页面测试结果API
 */

// 获取页面测试结果列表
export function getPageTestResultList(params) {
  return request({
    url: '/api/v1/pageResult',
    method: 'get',
    params
  })
}

// 获取页面测试结果详情
export function getPageTestResultDetail(id) {
  return request({
    url: `/api/v1/pageResult/${id}`,
    method: 'get'
  })
}

// 按页面实例获取最新测试结果
export function getLatestPageResultByInstance(instanceId) {
  return request({
    url: '/api/v1/pageResult/latest',
    method: 'get',
    params: { instanceId }
  })
}

// 删除页面测试结果
export function deletePageTestResult(id) {
  return request({
    url: `/api/v1/pageResult/${id}`,
    method: 'delete'
  })
}

export const deletePageResult = deletePageTestResult

// 批量删除页面测试结果
export function batchDeletePageTestResult(ids) {
  return request({
    url: '/api/v1/pageResult/batch',
    method: 'delete',
    data: { ids }
  })
}

export const batchDeletePageResult = batchDeletePageTestResult

// 清空页面测试结果
export function clearPageTestResults() {
  return request({
    url: '/api/v1/pageResult/clear',
    method: 'delete'
  })
}
