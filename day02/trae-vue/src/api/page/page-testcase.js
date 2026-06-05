import request from '@/utils/request'

/**
 * 页面测试用例API
 */

// 获取页面测试用例列表
export function getPageTestCaseList(params) {
  return request({
    url: '/page/testcase/list',
    method: 'get',
    params
  })
}

// 获取页面测试用例详情
export function getPageTestCaseDetail(id) {
  return request({
    url: `/page/testcase/${id}`,
    method: 'get'
  })
}

// 新增页面测试用例
export function addPageTestCase(data) {
  return request({
    url: '/page/testcase',
    method: 'post',
    data
  })
}

// 更新页面测试用例
export function updatePageTestCase(data) {
  return request({
    url: '/page/testcase',
    method: 'put',
    data
  })
}

// 删除页面测试用例
export function deletePageTestCase(id) {
  return request({
    url: `/page/testcase/${id}`,
    method: 'delete'
  })
}

// 批量删除页面测试用例
export function batchDeletePageTestCase(ids) {
  return request({
    url: '/page/testcase/batch',
    method: 'delete',
    data: { ids }
  })
}

// 执行页面测试用例
export function executePageTestCase(id) {
  return request({
    url: `/page/testcase/${id}/execute`,
    method: 'post'
  })
}

// 批量执行页面测试用例
export function batchExecutePageTestCase(ids) {
  return request({
    url: '/page/testcase/batch-execute',
    method: 'post',
    data: { ids }
  })
}
