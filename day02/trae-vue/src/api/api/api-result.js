import request from '@/utils/request'

/**
 * 接口测试结果API
 */

// 获取测试结果列表
export function getTestResultList(params) {
  return request({
    url: '/api/v1/apiResult',
    method: 'get',
    params
  })
}

// 获取测试结果详情
export function getTestResultDetail(id) {
  return request({
    url: `/api/v1/apiResult/${id}`,
    method: 'get'
  })
}

// 删除测试结果
export function deleteTestResult(id) {
  return request({
    url: `/api/v1/apiResult/${id}`,
    method: 'delete'
  })
}

// 批量删除测试结果
export function batchDeleteTestResult(ids) {
  return request({
    url: '/api/v1/apiResult/batch',
    method: 'delete',
    data: { ids }
  })
}

// 清空测试结果
export function clearTestResults() {
  return request({
    url: '/api/v1/apiResult/clear',
    method: 'delete'
  })
}

// 更新测试结果
export function updateTestResult(data) {
  return request({
    url: '/api/v1/apiResult',
    method: 'put',
    data
  })
}
