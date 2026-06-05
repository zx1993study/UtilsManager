import request from '@/utils/request'

/**
 * 接口测试用例API
 */

// 获取测试用例列表
export function getTestcaseList(params) {
  return request({
    url: '/api/v1/apiInstance',
    method: 'get',
    params
  })
}

// 获取测试用例详情
export function getTestcaseDetail(id) {
  return request({
    url: `/api/v1/apiInstance/${id}`,
    method: 'get'
  })
}

// 新增测试用例
export function addTestcase(data) {
  return request({
    url: '/api/v1/apiInstance',
    method: 'post',
    data
  })
}

// 更新测试用例
export function updateTestcase(data) {
  return request({
    url: '/api/v1/apiInstance',
    method: 'put',
    data
  })
}

// 删除测试用例
export function deleteTestcase(id) {
  return request({
    url: `/api/v1/apiInstance/${id}`,
    method: 'delete'
  })
}

// 批量删除测试用例
export function batchDeleteTestcase(ids) {
  return request({
    url: '/api/v1/apiInstance/batch',
    method: 'delete',
    data: { ids }
  })
}

// 执行测试用例
export function executeTestcase(id) {
  return request({
    url: `/api/v1/apiExecute/execute`,
    method: 'post',
    data: { executionType: 1, targetId: id }
  })
}

// 批量执行测试用例
export function batchExecuteTestcase(ids) {
  return request({
    url: '/api/v1/apiExecute/execute',
    method: 'post',
    data: { executionType: 2, targetIds: ids }
  })
}
