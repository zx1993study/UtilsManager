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

// 获取API的最新结果
export function getLatestResultByApiId(apiId) {
  return request({
    url: `/api/v1/apiResult/latest/api/${apiId}`,
    method: 'get'
  })
}

// 获取实例的最新结果
export function getLatestResultByInstanceId(instanceId) {
  return request({
    url: `/api/v1/apiResult/latest/instance/${instanceId}`,
    method: 'get'
  })
}

// 执行API（通过instanceId）
export function executeApi(instanceId, tokenId = null) {
  return request({
    url: '/api/v1/apiExecute/execute',
    method: 'post',
    data: { executionType: 1, targetId: instanceId, tokenId }
  })
}
