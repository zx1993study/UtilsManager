import request from '@/utils/request'

/**
 * 页面测试结果API
 */

// 获取页面测试结果列表
export function getPageTestResultList(params) {
  return request({
    url: '/page/result/list',
    method: 'get',
    params
  })
}

// 获取页面测试结果详情
export function getPageTestResultDetail(id) {
  return request({
    url: `/page/result/${id}`,
    method: 'get'
  })
}

// 删除页面测试结果
export function deletePageTestResult(id) {
  return request({
    url: `/page/result/${id}`,
    method: 'delete'
  })
}

// 批量删除页面测试结果
export function batchDeletePageTestResult(ids) {
  return request({
    url: '/page/result/batch',
    method: 'delete',
    data: { ids }
  })
}

// 清空页面测试结果
export function clearPageTestResults() {
  return request({
    url: '/page/result/clear',
    method: 'delete'
  })
}
