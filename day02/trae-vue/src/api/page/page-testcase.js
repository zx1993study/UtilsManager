import request from '@/utils/request'

/**
 * 页面测试用例API
 */

// 获取页面测试用例列表
export function getPageTestCaseList(params) {
  return request({
    url: '/api/v1/pageInstance',
    method: 'get',
    params
  })
}

// 获取页面测试用例详情
export function getPageTestCaseDetail(id) {
  return request({
    url: `/api/v1/pageInstance/${id}`,
    method: 'get'
  })
}

// 新增页面测试用例
export function addPageTestCase(data) {
  return request({
    url: '/api/v1/pageInstance',
    method: 'post',
    data
  })
}

export const addPageTestcase = addPageTestCase

// 更新页面测试用例
export function updatePageTestCase(data) {
  return request({
    url: '/api/v1/pageInstance',
    method: 'put',
    data
  })
}

export const updatePageTestcase = updatePageTestCase

// 删除页面测试用例
export function deletePageTestCase(id) {
  return request({
    url: `/api/v1/pageInstance/${id}`,
    method: 'delete'
  })
}

export const deletePageTestcase = deletePageTestCase

// 批量删除页面测试用例
export function batchDeletePageTestCase(ids) {
  return request({
    url: '/api/v1/pageInstance/batch',
    method: 'delete',
    data: { ids }
  })
}

export const batchDeletePageTestcase = batchDeletePageTestCase

// 执行页面测试用例
export function executePageTestCase(filePath, id) {
  return request({
    url: '/api/v1/page/execute',
    method: 'post',
    data: { filePath, instanceIds: [id] }
  })
}

// 批量执行页面测试用例
export function batchExecutePageTestCase(filePath, ids) {
  return request({
    url: '/api/v1/page/execute',
    method: 'post',
    data: { filePath, instanceIds: ids }
  })
}
